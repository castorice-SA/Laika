// Names and order are user-provided. Unwritten records carry no invented lore.
const characters = [
  "라이카", "펠리세트", "벨카", "스트렐카", "비온",
  "알리비나", "에노스", "아니타", "엑토르", "크라사프카",
  "도치카", "데지크", "아브레크", "리시치카", "체르누시카",
];
const recordId = (index) => String(index + 1).padStart(3, "0");
const requested = new URLSearchParams(window.location.search).get("character") ?? "001";
const index = characters.findIndex((_, position) => recordId(position) === requested);
const profile = document.querySelector("#profile");

if (index < 0) {
  document.title = "기록 없음 · 미종결 기록";
  const notice = document.createElement("p");
  notice.className = "empty-record";
  notice.textContent = "존재하지 않는 인물 기록입니다. 상단의 인물 명단에서 다시 선택해 주세요.";
  profile.replaceWith(notice);
  document.querySelector("footer p").textContent = "ERAC / RECORD NOT FOUND";
} else {
  const name = characters[index];
  document.title = name + " · 미종결 기록";
  document.querySelector(".intro .eyebrow").textContent = "PERSONNEL FILE / " + requested + " — 15";
  document.querySelector(".character-name").textContent = name;
  document.querySelector(".record-fields dd").textContent = name;
  document.querySelector("footer p").textContent = "ERAC / PERSONNEL " + requested;

  for (const [selector, offset, label] of [
    ["#previous-character", -1, "이전 인물"],
    ["#next-character", 1, "다음 인물"],
  ]) {
    const target = (index + offset + characters.length) % characters.length;
    const link = document.querySelector(selector);
    link.href = "profile.html?character=" + recordId(target);
    link.setAttribute("aria-label", label + ": " + characters[target]);
    link.title = characters[target];
  }

  if (index !== 0) {
    document.querySelector("#intro-title").textContent = name;
    const occupation = document.querySelector("#occupation-name");
    occupation.textContent = "미등록";
    occupation.classList.add("unrecorded");
    document.querySelector("#occupation-description").textContent = "직업 기록이 아직 등록되지 않았다.";
    const bio = document.querySelector(".profile-bio");
    bio.querySelectorAll("p").forEach((paragraph) => paragraph.remove());
    const pending = document.createElement("p");
    pending.className = "unrecorded";
    pending.textContent = "ERAC 소속. 세부 인물 기록 미등록.";
    bio.append(pending);
    document.querySelector(".portrait").hidden = true;
    document.querySelector(".empty-portrait").hidden = false;
  } else {
    document.querySelector(".attachments").hidden = false;
  }
  profile.hidden = false;
}
