import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

function checkInlineScripts(path) {
  const html = readFileSync(path, 'utf8');
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  let checked = 0;
  for (const [, attrs, body] of tags) {
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
    try { new Function(body); }
    catch (error) { throw new Error(path + ': inline script ' + (checked + 1) + ': ' + error.message); }
    checked++;
  }
  assert.ok(checked > 0, path + ': no inline scripts found');
  process.stdout.write('OK ' + path + ': ' + checked + ' inline script(s) parsed\n');
}

checkInlineScripts('index.html');
checkInlineScripts('preview-v21/index.html');

const app = readFileSync('index.html', 'utf8');
const rules = readFileSync('firestore.rules', 'utf8');
const preview = readFileSync('preview-v21/index.html', 'utf8');
const sonMatch = app.match(/const sonSyncKeys=\[([^\]]+)\]/);
const rulesMatch = rules.match(/request\.resource\.data\.payload\.keys\(\)\.hasOnly\(\[([\s\S]*?)\]\)/);
assert.ok(sonMatch, 'sonSyncKeys declaration not found');
assert.ok(rulesMatch, 'Son payload allowlist not found');
const sonKeys = [...sonMatch[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
const allowed = new Set([...rulesMatch[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
for (const key of sonKeys) assert.ok(allowed.has(key), 'Firestore rules do not allow Son sync key: ' + key);
assert.ok(!sonKeys.includes('subjects'), 'Dad-owned subjects must not be Son-writable');
assert.ok(!sonKeys.includes('schoolWeekRewards'), 'Dad-owned schoolWeekRewards must not be Son-writable');
assert.ok(preview.includes('preview-v21/preview-auth.js'), 'Preview auth script path is incorrect');
assert.ok(preview.includes("firebase.initializeApp(firebaseConfig,'kopilka-v21-preview')"), 'Preview must use a named Firebase app');
assert.ok(preview.includes('kopilka-v21-preview-family-v2'), 'Preview local storage must be isolated');
process.stdout.write('OK Son sync contract: ' + sonKeys.length + ' keys are allowed by Firestore rules\n');
process.stdout.write('OK preview isolation checks\n');
