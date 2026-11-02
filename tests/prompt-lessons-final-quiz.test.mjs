import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
test('final quiz covers eight questions with answer keys and no remote submission', () => {
  const html = read('tester/prompt-lessons/final-quiz.html');
  assert.equal((html.match(/<fieldset data-answer="[abc]">/g) || []).length, 8);
  assert.equal((html.match(/<input type="radio" name="q\d" value="[abc]">/g) || []).length, 24);
  assert.match(html, /answers and score stay in this browser session/);
  assert.match(html, /<script src="\/tester\/prompt-lessons\/final-quiz.js" defer><\/script>/);
  assert.doesNotMatch(html, /SageForge Core|core\.actionforgelabs\.com/i);
  assert.doesNotMatch(html, /<form[^>]+action=/i);
});
test('lesson eight and single-page lesson index link to final quiz', () => {
  for (const path of ['tester/prompt-lessons/08-building-a-prompt-library.html','tester/prompt-lessons/index.html']) {
    assert.match(read(path), /href="\/tester\/prompt-lessons\/final-quiz\.html"/);
  }
});
test('quiz JavaScript scores locally and does not send answers', () => {
  const script = read('tester/prompt-lessons/final-quiz.js');
  assert.match(script, /event\.preventDefault\(\)/);
  assert.match(script, /questions\.filter/);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
});
