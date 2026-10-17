import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDomain, exitCode } from '../scripts/check-public-domain.mjs';
const host='timectrl.allctrl.no';
const fixed=()=>new Date('2026-10-17T12:30:00Z');
const resolved=async()=>({status:'resolved',a:['192.0.2.1'],aaaa:[],cname:[],errors:[]});
const ok=async()=>({statusCode:200,tlsAuthorized:true});
const check=overrides=>checkDomain(host,{dns:resolved,https:ok,now:fixed,...overrides});
test('DNS plus TLS-validated success is confirmed and dated',async()=>{
 const r=await check();assert.equal(r.status,'confirmed');assert.equal(r.checkedAt,fixed().toISOString());assert.equal(exitCode([r]),0);
});
test('DNS uncertainty cannot be hidden by HTTP 200',async()=>{
 const r=await check({dns:async()=>({status:'unknown',a:[],aaaa:[],cname:[]})});
 assert.equal(r.status,'unverified');assert.equal(exitCode([r]),2);
});
test('DNS failure still permits independent HTTPS observation',async()=>{
 const r=await check({dns:async()=>{throw Object.assign(new Error('private details'),{code:'EAI_AGAIN'})}});
 assert.equal(r.dns.code,'EAI_AGAIN');assert.equal(r.https.status,'ok');assert(!JSON.stringify(r).includes('private details'));
});
for(const [statusCode,status] of [[301,'redirect-not-followed'],[401,'access-restricted'],[403,'access-restricted'],[405,'http-review'],[500,'http-review']]){
 test('HTTP '+statusCode+' is not confirmed',async()=>{
  const r=await check({https:async()=>({statusCode,tlsAuthorized:true})});
  assert.equal(r.https.status,status);assert.equal(r.status,'unverified');
 });
}
test('unverified TLS cannot be accepted as healthy',async()=>{
 const r=await check({https:async()=>({statusCode:200,tlsAuthorized:false})});
 assert.equal(r.https.status,'tls-unverified');assert.equal(r.status,'unverified');
});
test('network timeout is recorded without asserting outage',async()=>{
 const r=await check({https:async()=>{throw Object.assign(new Error('sensitive debug'),{code:'CHECK_TIMEOUT'})}});
 assert.equal(r.https.code,'CHECK_TIMEOUT');assert.equal(r.status,'unverified');assert(!JSON.stringify(r).includes('sensitive debug'));
});
test('arbitrary targets are rejected before any network call',async()=>{
 let called=false;await assert.rejects(()=>checkDomain('localhost',{dns:async()=>{called=true}}),/Unsupported/);assert.equal(called,false);
});
test('bounded timeout is validated and passed to both probes',async()=>{
 await assert.rejects(()=>check({timeoutMs:0}),/Invalid timeout/);
 const seen=[];await check({timeoutMs:123,dns:async(h,t)=>{seen.push([h,t]);return resolved()},https:async(h,t)=>{seen.push([h,t]);return ok()}});
 assert.deepEqual(seen,[[host,123],[host,123]]);
});
