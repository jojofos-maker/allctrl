// Static source checks only: not browser, accessibility or app acceptance tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = readFileSync(new URL('../medctrl/index.html', import.meta.url), 'utf8');
const mirror = readFileSync(new URL('../website/medctrl/index.html', import.meta.url), 'utf8');

test('root and export mirror retain identical medctrl markup', () => {
  assert.equal(root, mirror);
});
test('product is explicitly an idea, not a released app', () => {
  assert.match(root, /class="module-status status-idea">Ide<\/span>/);
  assert.match(root, /Status er ide under utvikling/);
});
test('mockup remains labelled as a concept image', () => {
  assert.match(root, /<figcaption>Konseptbilde · viser mulige funksjoner<\/figcaption>/);
  assert.match(root, /alt="Konseptbilde av medctrl på telefon og PC"/);
});
test('internal section buttons resolve to named page anchors', () => {
  const targets = [...root.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(targets.length > 0);
  const ids = new Set([...root.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const target of targets) assert.ok(ids.has(target), `missing section: ${target}`);
});
test('testing interest is an email link, not an app signup form', () => {
  assert.match(root, /data-interest="medctrl" href="mailto:/);
  assert.match(root, /ikke en garanti om tilgang/);
  assert.doesNotMatch(root, /<form\b/i);
});
test('medical boundary and website privacy link remain visible in source', () => {
  assert.match(root, /Medisinske råd og behandling hører fortsatt hjemme hos helsepersonell/);
  assert.match(root, /href="\.\.\/personvern\.html">Personvern<\/a>/);
});
