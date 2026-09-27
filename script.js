const requested = new URLSearchParams(window.location.search).get("character") ?? "001";
const index = CHARACTER_RECORDS.findIndex((record) => record.id === requested);
const profile = document.querySelector("#profile");
const put = (selector, text) => { document.querySelector(selector).textContent = text; };

if (index < 0) {
  document.title = "기록 없음 · 미종결 기록";
  const notice = document.createElement("p");
  notice.className = "empty-record";
  notice.textContent = "존재하지 않는 인물 기록입니다. 상단의 인물 명단에서 다시 선택해 주세요.";
  profile.replaceWith(notice);
  put("footer p", "ERAC / RECORD NOT FOUND");
} else {
  const person = CHARACTER_RECORDS[index];
  document.title = person.name + " · 미종결 기록";
  put(".intro .eyebrow", "INVESTIGATION TEAM 01 / " + person.id + " — 15");
  put("#intro-title", index === 0 ? "RAIKA" : person.name);
  put(".character-name", person.name);
  put("#record-name", person.name);
  put("#record-age", person.age + "세");
  put("#record-role", person.role);
  put("#record-specialty", person.specialty);
  put("#occupation-name", person.occupation);
  put("#occupation-description", person.occupationDescription);
  put("footer p", "ERAC / TEAM 01 / " + person.id);

  const bio = document.querySelector("#bio-text");
  for (const text of person.bio) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bio.append(paragraph);
  }
  for (const key of ["history", "methods", "limits", "stance"]) {
    put("#record-" + key, person[key]);
  }
  const relationships = document.querySelector("#record-relationships");
  for (const relation of person.relationships) {
    const target = CHARACTER_RECORDS.find((record) => record.id === relation.id);
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "profile.html?character=" + target.id;
    link.textContent = target.name + " · " + target.role;
    const description = document.createElement("p");
    description.textContent = relation.text;
    item.append(link, description);
    relationships.append(item);
  }

  for (const [selector, offset, label] of [
    ["#previous-character", -1, "이전 인물"],
    ["#next-character", 1, "다음 인물"],
  ]) {
    const target = CHARACTER_RECORDS[(index + offset + CHARACTER_RECORDS.length) % CHARACTER_RECORDS.length];
    const link = document.querySelector(selector);
    link.href = "profile.html?character=" + target.id;
    link.setAttribute("aria-label", label + ": " + target.name);
    link.title = target.name;
  }

  document.querySelector(".portrait").hidden = index !== 0;
  document.querySelector(".empty-portrait").hidden = index === 0;
  document.querySelector(".attachments").hidden = index !== 0;
  put("#portrait-record", "TEAM 01 / " + person.id);
  profile.hidden = false;
  document.querySelector("#personnel-detail").hidden = false;
}
