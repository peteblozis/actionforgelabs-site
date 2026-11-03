import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

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
 if (!existsSync(evidence)) {
  test.skip('BLOCKED: no real Freemius sandbox purchase and entitlement readback evidence');
  return;
 }
 const item = JSON.parse(readFileSync(evidence, 'utf8'));
 assert.equal(item.environment, 'sandbox');
 assert.ok(item.transaction_id && item.license_id && item.readback_verified === true);
 assert.ok(item.checkout_source && item.timestamp && item.commit_sha);
});

test('tester home links to exactly the eight canonical lesson pages', () => {
 const home = readFileSync(new URL('index.html', lessonDir), 'utf8');
 const linked = [...home.matchAll(/href=["']\.\/([^"']+\.html)["']/g)].map(m => m[1]);
 assert.deepEqual(linked, lessons, 'tester home must link all eight lessons in order');
 assert.doesNotMatch(home, /<section\s+id=["']lesson-\d/i, 'no conflicting duplicate lesson series');
 assert.match(home, /mailto:peteblozis@gmail\.com\?subject=Prompt%20Lessons%20Feedback/);
 const last = readFileSync(new URL(lessons.at(-1), lessonDir), 'utf8');
 assert.doesNotMatch(last, /tester feedback form on the tester home page/i, 'do not promise a missing form');
 assert.match(last, /mailto:peteblozis@gmail\.com/);
});
