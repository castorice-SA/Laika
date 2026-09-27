const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const entry = read('index.html');
const profile = read('profile.html');
const legacy = read('characters.html');
assert.ok(entry.includes('황실 이상현상 연구청') && profile.includes('황실 이상현상 연구청'));
assert.ok(profile.includes('Extranormal Research Agency of the Crown'));
assert.ok(profile.includes('전후 대륙에서 발생한 이상현상에 전문적으로 대항하기 위해 설립된 신비 연구 기관.'));
assert.ok(entry.includes('erac-logo-extranormal-v2.png'));
assert.doesNotMatch(entry + profile, /왕실|고대신비|Eldritch|ELDRITCH|AUTHORITY|마법 학회|대영제국/);
assert.match(entry, /class="access-button" href="profile.html"/);
assert.match(entry, /id="terminal-title">LAIKA</);
assert.match(profile, /id="intro-title">LAIKA</);
assert.doesNotMatch(entry + profile, /RAIKA|Raika/);
assert.ok(read('README.md').includes('https://castorice-sa.github.io/Laika/'));
for (const text of ["Vivre, c'est faire vivre l'absurde.", 'But Man is not made for defeat.', 'A man can be destroyed but not defeated.', '산다는 것은 부조리를 살려 두는 것이다.', '하지만 인간은 패배하도록 만들어지지 않았다.', '인간은 파괴될지언정 패배하지 않는다.']) assert.ok(entry.includes(text), text);
for (const text of ['라이카', '31세', '조사 1팀', '팀장', '학자', '인물 소개', '신념', '연구청과의 관계', '개인적 장점', '개인적 결함']) assert.ok(profile.includes(text), text);
assert.doesNotMatch(profile, /지휘 성향|거절하기 어려운 충분한 이유/);
assert.doesNotMatch(entry + profile, /characters-data|<script|character-switcher|character-arrow|인물 명단|15명|잔향 중계소|미종결 기록/);
assert.doesNotMatch(profile, /\shidden(?:\s|>|=)|href="[^"]*character/);
for (const id of ['personnel-detail', 'attachments']) {
  assert.ok(profile.includes('href="#' + id + '"') && profile.includes('id="' + id + '"'));
}
assert.equal((profile.match(/<h1\b/g) || []).length, 1);
assert.equal((profile.match(/<img\b/g) || []).length, 7);
assert.match(legacy, /http-equiv="refresh" content="0; url=profile.html"/);
assert.match(legacy, /href="profile.html"/);
for (const html of [entry, profile, legacy]) {
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const file = match[1].split('?')[0];
    if (/^(?:data:|https?:|#)/.test(file)) continue;
    assert.ok(fs.existsSync(path.resolve(root, file)), 'Missing local file: ' + file);
  }
}
assert.ok(!fs.existsSync(path.join(root, 'characters-data.js')));
assert.ok(!fs.existsSync(path.join(root, 'script.js')));
console.log('PASS: Laika-only static profile, entry quotes and navigation, legacy redirect, seven images and local assets.');
