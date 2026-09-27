const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('characters-data.js');
const people = vm.runInNewContext(source + '; CHARACTER_RECORDS');
const script = read('script.js');
const html = read('profile.html');
const roster = read('characters.html');
const notes = read('docs/TEAM-01.md');
const names = '라이카 펠리세트 벨카 스트렐카 비온 알리비나 에노스 아니타 엑토르 크라사프카 도치카 데지크 아브레크 리시치카 체르누시카'.split(' ');
assert.equal(people.length, 15);
assert.equal(new Set(people.map(p => p.id)).size, 15);
assert.equal(people.filter(p => p.role === '팀장').length, 1);
assert.equal(people[0].role, '팀장');
assert.equal(people[1].role, '부팀장');
assert.ok(html.indexOf('characters-data.js?') < html.indexOf('src="script.js?'));

// Minimal DOM fixture for every profile branch, based on actual template IDs.
function render(search) {
  const elements = new Map();
  function element() {
    return { textContent: '', hidden: true, children: [], attributes: {},
      append(...items) { this.children.push(...items); },
      setAttribute(key, value) { this.attributes[key] = value; },
      replaceWith(item) { this.replacement = item; } };
  }
  for (const match of html.matchAll(/id="([^"]+)"/g)) elements.set('#' + match[1], element());
  for (const selector of ['.intro .eyebrow', '.character-name', 'footer p', '.portrait', '.empty-portrait', '.attachments']) elements.set(selector, element());
  const document = {
    title: '', createElement: element,
    querySelector(selector) { assert.ok(elements.has(selector), 'Missing template selector: ' + selector); return elements.get(selector); }
  };
  vm.runInNewContext(source + '\n' + script, {document, window: {location: {search}}, URLSearchParams});
  return {document, elements};
}

for (let i = 0; i < people.length; i++) {
  const p = people[i];
  assert.equal(p.id, String(i + 1).padStart(3, '0'));
  assert.equal(p.name, names[i]);
  assert.ok(Number.isInteger(p.age) && p.age >= 18);
  for (const key of ['role', 'unit', 'occupation', 'specialty', 'occupationDescription', 'history', 'methods', 'limits', 'stance']) {
    assert.ok(typeof p[key] === 'string' && p[key].length > 0, p.name + ': ' + key);
    assert.ok(notes.includes(p[key]), 'Setting book missing: ' + p.name + '/' + key);
  }
  assert.ok(p.bio.length >= 2 && p.bio.every(t => t.length > 40));
  for (const rel of p.relationships) {
    assert.ok(people.some(target => target.id === rel.id) && rel.id !== p.id);
    assert.ok(rel.text.length > 0);
  }
  const card = roster.split('\n').find(line => line.includes('aria-label="' + p.name + ' 인물 기록 열기"'));
  assert.ok(card && card.includes(p.role) && card.includes(p.occupation) && card.includes(p.specialty));
  const {document, elements: e} = render('?character=' + p.id);
  assert.equal(document.title, p.name + ' · 미종결 기록');
  assert.equal(e.get('#record-name').textContent, p.name);
  assert.equal(e.get('#record-role').textContent, p.role);
  assert.equal(e.get('#occupation-description').textContent, p.occupationDescription);
  assert.equal(e.get('#bio-text').children.length, p.bio.length);
  assert.equal(e.get('#record-relationships').children.length, p.relationships.length);
  assert.equal(e.get('#profile').hidden, false);
  assert.equal(e.get('#personnel-detail').hidden, false);
  assert.equal(e.get('.portrait').hidden, i !== 0);
  assert.equal(e.get('.attachments').hidden, i !== 0);
  assert.equal(e.get('#next-character').href, 'profile.html?character=' + people[(i + 1) % 15].id);
  assert.equal(e.get('#previous-character').href, 'profile.html?character=' + people[(i + 14) % 15].id);
}
assert.equal(render('').elements.get('#record-name').textContent, '라이카');
for (const value of ['000', '016', '', '<script>', '1']) {
  const result = render('?character=' + encodeURIComponent(value));
  assert.equal(result.document.title, '기록 없음 · 미종결 기록');
  assert.ok(result.elements.get('#profile').replacement);
  assert.equal(result.elements.get('#personnel-detail').hidden, true);
}
console.log('PASS: 15 complete profiles, roster and setting-book sync, 30 relationship targets, navigation wraparound, default and invalid IDs.');
