import { Resolver } from 'node:dns/promises';
import { request } from 'node:https';
import { pathToFileURL } from 'node:url';

export const targets = Object.freeze(['timectrl.allctrl.no', 'www.allctrl.no', 'allctrl.no']);
export async function readDns(host, timeoutMs) {
  const resolver = new Resolver({ timeout: timeoutMs, tries: 1 });
  const timer = setTimeout(() => resolver.cancel(), timeoutMs);
  try {
    const queries = await Promise.allSettled([
      resolver.resolve4(host), resolver.resolve6(host), resolver.resolveCname(host),
    ]);
    const [a, aaaa, cname] = queries.map(r => r.status === 'fulfilled' ? r.value : []);
    const errors = queries.flatMap((r, i) => r.status === 'rejected'
      ? [{ type: ['A', 'AAAA', 'CNAME'][i], code: r.reason.code || 'DNS_ERROR' }] : []);
    return { status: a.length || aaaa.length ? 'resolved' : 'unknown', a, aaaa, cname, errors };
  } finally { clearTimeout(timer); }
}
export function readHttps(host, timeoutMs) {
  return new Promise((resolve, reject) => {
    // HEAD only: no credentials/cookies, no response body and no redirect following.
    const req = request({ hostname: host, path: '/', method: 'HEAD', port: 443,
      rejectUnauthorized: true, headers: { 'User-Agent': 'allctrl-readonly-domain-check/1' } }, res => {
      const result = { statusCode: res.statusCode, tlsAuthorized: res.socket.authorized === true };
      res.destroy();
      resolve(result);
    });
    // An absolute deadline includes DNS/TCP/TLS, unlike only a socket inactivity timeout.
    const timer = setTimeout(() => req.destroy(Object.assign(new Error('Deadline'), { code: 'CHECK_TIMEOUT' })), timeoutMs);
    req.on('error', reject);
    req.on('close', () => clearTimeout(timer));
    req.end();
  });
}
export async function checkDomain(host, { dns = readDns, https = readHttps, now = () => new Date(), timeoutMs = 5000 } = {}) {
  if (!targets.includes(host)) throw new Error('Unsupported target');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new Error('Invalid timeout');
  const result = { host, checkedAt: now().toISOString(), dns: null, https: null, status: 'unverified' };
  try { result.dns = await dns(host, timeoutMs); }
  catch (error) { result.dns = { status: 'unknown', code: error.code || 'DNS_ERROR' }; }
  try {
    const response = await https(host, timeoutMs);
    const status = response.tlsAuthorized !== true ? 'tls-unverified'
      : response.statusCode >= 200 && response.statusCode < 300 ? 'ok'
      : response.statusCode >= 300 && response.statusCode < 400 ? 'redirect-not-followed'
      : response.statusCode === 401 || response.statusCode === 403 ? 'access-restricted'
      : 'http-review';
    result.https = { ...response, status };
  } catch (error) { result.https = { status: 'unknown', code: error.code || 'HTTPS_ERROR' }; }
  if (result.dns.status === 'resolved' && result.https.status === 'ok') result.status = 'confirmed';
  // Network restrictions and DNS/TLS errors are observations, not proof of an outage.
  return result;
}
export function exitCode(results) { return results.every(r => r.status === 'confirmed') ? 0 : 2; }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const requested = process.argv.slice(2);
  if (requested.some(host => !targets.includes(host))) {
    console.error('Use only: ' + targets.join(', '));
    process.exitCode = 1;
  } else {
    const results = await Promise.all((requested.length ? [...new Set(requested)] : [targets[0]]).map(host => checkDomain(host)));
    console.log(JSON.stringify({ results, limitation: 'DNS and HTTPS HEAD only; not login, app health, mail delivery, backup or deployment verification.' }, null, 2));
    process.exitCode = exitCode(results);
  }
}
