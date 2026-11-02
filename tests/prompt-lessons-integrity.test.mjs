import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const lessonDir = new URL('../tester/prompt-lessons/', import.meta.url);
const lessons = [
 '01-what-is-a-prompt.html','02-clarity-over-cleverness.html',
 '03-give-it-a-role.html','04-show-dont-tell.html',
 '05-constraints-and-format.html','06-iterating-not-redoing.html',
 '07-when-it-goes-wrong.html','08-building-a-prompt-library.html'
];

test('all eight private tester lessons are present and excluded from indexing', () => {
 for (const name of lessons) {
  const url = new URL(name, lessonDir);
  assert.ok(existsSync(url), 'missing lesson: '+name);
  const html = readFileSync(url, 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="noindex, nofollow"/i, name);
  assert.match(html, /<title>[^<]+<\/title>/i, name);
 }
});

test('local lesson links resolve inside the tester lesson folder', () => {
 for (const name of lessons) {
  const html = readFileSync(new URL(name, lessonDir), 'utf8');
  for (const match of html.matchAll(/href=["']([^"'#?]+\.html)(?:[?#][^"']*)?["']/g)) {
   const href = match[1];
   if (/^(https?:|\/)/i.test(href)) continue;
   assert.ok(existsSync(new URL(href, new URL(name, lessonDir))), name+' broken link: '+href);
  }
 }
});

test('sandbox checkout cannot be marked verified without actual transaction evidence', () => {
 const evidence = new URL('../evidence/prompt-lessons/sandbox-purchase-verified.json', import.meta.url);
 if (!existsSync(evidence)) return; // No claim made: not a passing purchase verification
 const item = JSON.parse(readFileSync(evidence, 'utf8'));
 assert.equal(item.environment, 'sandbox');
 assert.ok(item.transaction_id && item.license_id && item.readback_verified === true);
 assert.ok(item.checkout_source && item.timestamp && item.commit_sha);
});
