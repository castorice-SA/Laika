(() => {
  "use strict";

  const STORAGE_KEY = "laika-cyoa-v1";
  const BASE_RESOURCE = 8;
  const RISK_CAP = 6;

  const sections = [
    {
      id: "stance",
      number: "01",
      title: "재조사 원칙",
      description: "같은 사건도 무엇을 먼저 지키느냐에 따라 전혀 다른 조사 계획이 됩니다. 하나의 원칙만 선택하십시오.",
      mode: "single",
      required: true,
      rule: "1개 선택 · 비용 없음",
      choices: [
        {
          id: "stance_record",
          code: "METHOD / RECORD",
          title: "기록이 맞을 때까지 대조한다",
          body: "종결 보고서, 인계 명부, 물품 기록의 작성 시점과 책임자를 먼저 교차 검증한다. 현장 재진입보다 문서의 빈칸을 우선한다.",
          cost: 0,
          risk: 0,
          effect: "기록 기반 선택지 해금",
          tags: ["record"]
        },
        {
          id: "stance_people",
          code: "METHOD / PEOPLE",
          title: "사람이 견딜 수 있는 질문부터 한다",
          body: "생존자와 팀원의 침묵을 자료처럼 다루지 않는다. 증언의 속도와 공개 범위를 당사자의 선택에 맞춘다.",
          cost: 0,
          risk: 0,
          effect: "증언 기반 선택지 해금",
          tags: ["people"]
        },
        {
          id: "stance_field",
          code: "METHOD / FIELD",
          title: "끝난 현장을 다시 본다",
          body: "문서의 오차만으로 결론 내리지 않는다. 위험 조건을 재평가하고, 필요하다면 폐쇄 중계소의 관측 사각을 직접 확인한다.",
          cost: 0,
          risk: 1,
          effect: "현장 선택지 해금 · 위험 +1",
          tags: ["field"]
        }
      ]
    },
    {
      id: "clues",
      number: "02",
      title: "남아 있는 불일치",
      description: "각 항목은 여덟 번째 사람의 존재를 입증하지 않습니다. 다만 공식 결론이 설명하지 못한 부분을 남깁니다.",
      mode: "multi",
      max: 3,
      required: true,
      rule: "최대 3개 · 각 자원 1",
      choices: [
        {
          id: "clue_blanket",
          code: "EVIDENCE / 08",
          title: "보온포 여덟 개",
          body: "사용 처리된 보온포는 여덟 개, 구조 인계된 민간인은 일곱 명. 도치카가 최초로 보고한 수량 불일치.",
          cost: 1,
          risk: 0,
          effect: "수량 대조",
          tags: ["record", "count"]
        },
        {
          id: "clue_manifest",
          code: "EVIDENCE / 07",
          title: "인계 명부 일곱 명",
          body: "누가 누구를 언제 인계했는지 다시 추적한다. 누락이 현장에 있었는지, 서류에 있었는지는 아직 모른다.",
          cost: 1,
          risk: 0,
          effect: "책임 흐름 추적",
          tags: ["record", "people"]
        },
        {
          id: "clue_coat",
          code: "EVIDENCE / UNKNOWN",
          title: "소유자 불명의 외투",
          body: "회수품 목록의 주인 없는 외투. 구조된 일곱 명의 물품인지, 현장 잔존물인지 분류가 끝나지 않았다.",
          cost: 1,
          risk: 0,
          effect: "신원 단서",
          tags: ["field", "identity"]
        },
        {
          id: "clue_call",
          code: "EVIDENCE / SIGNAL",
          title: "해석되지 않은 호출",
          body: "중계 기록 끝부분에 남은 불완전한 호출. 음성인지 반복 신호인지조차 합의되지 않은 채 보관되었다.",
          cost: 1,
          risk: 1,
          effect: "신호 분석 · 위험 +1",
          tags: ["signal", "field"]
        }
      ]
    },
    {
      id: "team",
      number: "03",
      title: "재검토에 부를 사람",
      description: "조사 1팀의 판단은 한 사람의 확신으로 완성되지 않습니다. 서로 다른 책임과 전문성을 가진 인원을 선택하십시오.",
      mode: "multi",
      max: 2,
      required: false,
      rule: "최대 2명 · 각 자원 1",
      choices: [
        {
          id: "team_dochika",
          code: "TEAM / RECORD",
          title: "도치카 · 기록 분석",
          body: "보온포와 인계 명부의 불일치를 처음 보고한 기록 담당자. 작은 차이를 결론이 아니라 검증 대상으로 남긴다.",
          cost: 1,
          risk: 0,
          effect: "기록 검증 강화",
          tags: ["record"],
          requires: () => hasAny("clue_blanket", "clue_manifest"),
          lockText: "보온포 또는 인계 명부를 먼저 선택해야 합니다."
        },
        {
          id: "team_felisette",
          code: "TEAM / CONTROL",
          title: "펠리세트 · 작전 조정",
          body: "부팀장. 재조사 자체와 실행 가능한 재조사를 구분하고, 허가와 책임 범위를 문서로 남긴다.",
          cost: 1,
          risk: 0,
          effect: "공식 절차 확보",
          tags: ["procedure"]
        },
        {
          id: "team_avrek",
          code: "TEAM / SAFETY",
          title: "아브레크 · 현장 안전",
          body: "첫 조사에서 추가 진입 중단을 건의했다. 다시 들어가려면 당시 철수 판단부터 검증해야 한다.",
          cost: 1,
          risk: 0,
          effect: "현장 위험 완화",
          tags: ["field", "safety"],
          requires: () => isSelected("stance_field") || hasAny("clue_coat", "clue_call"),
          lockText: "현장 접근 원칙 또는 현장성 단서를 먼저 선택해야 합니다."
        }
      ]
    },
    {
      id: "actions",
      number: "04",
      title: "실행할 조사",
      description: "무엇을 알아낼지보다 무엇을 감수할지가 드러나는 단계입니다. 자원이 허용하는 만큼 복수 선택할 수 있습니다.",
      mode: "multi",
      max: 3,
      required: true,
      rule: "최대 3개 · 조건부 해금",
      choices: [
        {
          id: "action_crosscheck",
          code: "ACTION / ARCHIVE",
          title: "원본 기록 재대조",
          body: "종결 보고서가 만들어지기 전 단계의 원본 기록을 다시 배열한다. 작성 시각과 수정 이력의 간극을 찾는다.",
          cost: 2,
          risk: 0,
          effect: "안전 · 느린 검증",
          tags: ["record"],
          requires: () => countTags("record") >= 2,
          lockText: "기록 성격의 선택을 2개 이상 확보해야 합니다."
        },
        {
          id: "action_witness",
          code: "ACTION / TESTIMONY",
          title: "생존자 재면담",
          body: "일곱 명에게 같은 질문을 반복하지 않는다. 기억이 아니라 당시 서로 확인했던 사람과 순서를 묻는다.",
          cost: 2,
          risk: 0,
          effect: "증언 교차 확인",
          tags: ["people"],
          requires: () => isSelected("stance_people") || isSelected("clue_manifest"),
          lockText: "사람 중심 원칙 또는 인계 명부를 먼저 선택해야 합니다."
        },
        {
          id: "action_signal",
          code: "ACTION / SIGNAL",
          title: "중계 신호 재생",
          body: "보관된 신호를 제한된 환경에서 다시 분석한다. 현장과 동일한 반복 조건이 발생할 가능성을 감수한다.",
          cost: 2,
          risk: 2,
          effect: "신호 검증 · 위험 +2",
          tags: ["signal"],
          requires: () => isSelected("clue_call"),
          lockText: "해석되지 않은 호출을 먼저 선택해야 합니다."
        },
        {
          id: "action_reentry",
          code: "ACTION / RE-ENTRY",
          title: "폐쇄 중계소 조건부 재진입",
          body: "관측 사각을 직접 확인한다. 재진입은 안전 담당의 중단 권한과 철수 기준을 문서화한 경우에만 추진한다.",
          cost: 3,
          risk: 3,
          effect: "직접 확인 · 위험 +3",
          tags: ["field"],
          requires: () => isSelected("team_avrek") && (isSelected("stance_field") || isSelected("team_felisette")),
          lockText: "아브레크와 현장 접근 원칙 또는 펠리세트가 필요합니다."
        }
      ]
    },
    {
      id: "directive",
      number: "05",
      title: "처리 방침",
      description: "조사가 끝났다고 선언하는 대신, 지금 확보한 근거로 어디까지 책임질 수 있는지 결정합니다.",
      mode: "single",
      required: true,
      rule: "1개 선택 · 최종 출력",
      choices: [
        {
          id: "directive_hold",
          code: "DIRECTIVE / OPEN",
          title: "미종결 상태를 유지한다",
          body: "존재를 입증하지 못했다는 이유만으로 가능성을 삭제하지 않는다. 추가 근거가 생길 때까지 사건 번호를 열어 둔다.",
          cost: 0,
          risk: 0,
          effect: "보존 우선",
          tags: ["open"]
        },
        {
          id: "directive_identity",
          code: "DIRECTIVE / SUBJECT",
          title: "미확인 대상 임시 식별자를 부여한다",
          body: "여덟 번째 사람을 확정하지 않은 채, 서로 다른 단서가 같은 대상을 가리키는지 추적할 수 있도록 임시 식별자를 만든다.",
          cost: 0,
          risk: 0,
          effect: "추적 가능성 확보",
          tags: ["identity"],
          requires: () => selectedClueCount() >= 2,
          lockText: "서로 다른 불일치 단서를 2개 이상 선택해야 합니다."
        },
        {
          id: "directive_request",
          code: "DIRECTIVE / REVIEW",
          title: "공식 재조사 승인을 요청한다",
          body: "개인의 집착으로 남기지 않는다. 선택한 근거, 위험, 반대 의견까지 포함해 연구청의 공식 검토 대상으로 올린다.",
          cost: 0,
          risk: 0,
          effect: "기관 책임으로 전환",
          tags: ["procedure"],
          requires: () => selectedActionCount() >= 2 && resourceRemaining() >= 0,
          lockText: "실행할 조사를 2개 이상 구성해야 합니다."
        }
      ]
    }
  ];

  const sectionMap = new Map(sections.map(section => [section.id, section]));
  const choiceMap = new Map();
  sections.forEach(section => {
    section.choices.forEach(choice => {
      choice.sectionId = section.id;
      choiceMap.set(choice.id, choice);
    });
  });

  const state = {
    selected: new Set()
  };

  const els = {
    sections: document.querySelector("#choice-sections"),
    template: document.querySelector("#choice-template"),
    resource: document.querySelector("#resource-value"),
    risk: document.querySelector("#risk-value"),
    progress: document.querySelector("#progress-bar"),
    status: document.querySelector("#status-message"),
    count: document.querySelector("#selection-count"),
    summary: document.querySelector("#selection-summary"),
    resultState: document.querySelector("#result-state"),
    resultSummary: document.querySelector("#result-summary"),
    resultNotes: document.querySelector("#result-notes"),
    copy: document.querySelector("#copy-report")
  };

  function isSelected(id) {
    return state.selected.has(id);
  }

  function hasAny(...ids) {
    return ids.some(isSelected);
  }

  function selectedChoices() {
    return [...state.selected].map(id => choiceMap.get(id)).filter(Boolean);
  }

  function resourceSpent(excludingIds = []) {
    const excluded = new Set(excludingIds);
    return selectedChoices()
      .filter(choice => !excluded.has(choice.id))
      .reduce((sum, choice) => sum + (choice.cost || 0), 0);
  }

  function resourceRemaining() {
    return BASE_RESOURCE - resourceSpent();
  }

  function riskTotal() {
    return selectedChoices().reduce((sum, choice) => sum + (choice.risk || 0), 0);
  }

  function countTags(tag) {
    return selectedChoices().filter(choice => (choice.tags || []).includes(tag)).length;
  }

  function selectedInSection(sectionId) {
    return selectedChoices().filter(choice => choice.sectionId === sectionId);
  }

  function selectedClueCount() {
    return selectedInSection("clues").length;
  }

  function selectedActionCount() {
    return selectedInSection("actions").length;
  }

  function meetsRequirement(choice) {
    return !choice.requires || choice.requires();
  }

  function refundableIds(section, incomingChoice) {
    if (section.mode !== "single") return [];
    return selectedInSection(section.id)
      .filter(choice => choice.id !== incomingChoice.id)
      .map(choice => choice.id);
  }

  function disabledReason(choice, section) {
    if (isSelected(choice.id)) return "";

    if (!meetsRequirement(choice)) {
      return choice.lockText || "선행 조건이 필요합니다.";
    }

    if (section.mode === "multi" && section.max && selectedInSection(section.id).length >= section.max) {
      return `이 구획에서는 최대 ${section.max}개까지 선택할 수 있습니다.`;
    }

    const projectedSpent = resourceSpent(refundableIds(section, choice)) + (choice.cost || 0);
    if (projectedSpent > BASE_RESOURCE) {
      return "남은 조사 자원이 부족합니다.";
    }

    const projectedRisk = riskTotal() + (choice.risk || 0);
    if (projectedRisk > RISK_CAP) {
      return "허용 가능한 노출 위험을 초과합니다.";
    }

    return "";
  }

  function sanitizeSelections() {
    let changed = true;
    while (changed) {
      changed = false;
      for (const choice of selectedChoices()) {
        if (!meetsRequirement(choice)) {
          state.selected.delete(choice.id);
          changed = true;
        }
      }
    }
  }

  function toggleChoice(choice, section) {
    if (isSelected(choice.id)) {
      state.selected.delete(choice.id);
      sanitizeSelections();
      persist();
      render();
      return;
    }

    const reason = disabledReason(choice, section);
    if (reason) {
      els.status.textContent = reason;
      return;
    }

    if (section.mode === "single") {
      selectedInSection(section.id).forEach(existing => state.selected.delete(existing.id));
    }

    state.selected.add(choice.id);
    sanitizeSelections();
    persist();
    render();
  }

  function renderSections() {
    if (!els.sections.children.length) {
      sections.forEach(section => {
        const wrapper = document.createElement("section");
        wrapper.className = "choice-section";
        wrapper.dataset.section = section.id;
        wrapper.innerHTML = `
          <div class="section-heading">
            <div>
              <span class="section-number">${section.number}</span>
              <h2>${section.title}</h2>
              <p>${section.description}</p>
            </div>
            <span class="section-rule">${section.rule}</span>
          </div>
          <div class="choice-grid"></div>
        `;

        const grid = wrapper.querySelector(".choice-grid");
        section.choices.forEach(choice => {
          const card = els.template.content.firstElementChild.cloneNode(true);
          card.dataset.choice = choice.id;
          card.querySelector(".choice-code").textContent = choice.code;
          card.querySelector(".choice-title").textContent = choice.title;
          card.querySelector(".choice-body").textContent = choice.body;
          card.querySelector(".choice-effect").textContent = choice.effect || "";
          card.addEventListener("click", () => toggleChoice(choice, section));
          grid.append(card);
        });

        els.sections.append(wrapper);
      });
    }

    sections.forEach(section => {
      section.choices.forEach(choice => {
        const card = document.querySelector(`[data-choice="${choice.id}"]`);
        const selected = isSelected(choice.id);
        const reason = disabledReason(choice, section);

        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-pressed", String(selected));
        card.disabled = Boolean(reason) && !selected;
        card.querySelector(".choice-state").textContent = selected ? "선택됨" : "선택";
        card.querySelector(".choice-lock").textContent = reason;

        const costParts = [];
        if (choice.cost) costParts.push(`자원 -${choice.cost}`);
        if (choice.risk) costParts.push(`위험 +${choice.risk}`);
        card.querySelector(".choice-cost").textContent = costParts.length ? costParts.join(" · ") : "COST / 0";
      });
    });
  }

  function renderStatus() {
    const remaining = resourceRemaining();
    const risk = riskTotal();
    const selected = state.selected.size;
    const totalRequiredSections = sections.filter(section => section.required).length;
    const completedRequired = sections.filter(section => section.required && selectedInSection(section.id).length > 0).length;

    els.resource.textContent = String(remaining);
    els.risk.textContent = String(risk);
    els.progress.style.width = `${Math.round((completedRequired / totalRequiredSections) * 100)}%`;

    if (!selectedInSection("stance").length) {
      els.status.textContent = "재조사 원칙을 선택하십시오.";
    } else if (!selectedClueCount()) {
      els.status.textContent = "설명되지 않은 불일치 단서를 선택하십시오.";
    } else if (!selectedActionCount()) {
      els.status.textContent = "선택한 근거를 어떻게 검증할지 결정하십시오.";
    } else if (!selectedInSection("directive").length) {
      els.status.textContent = "현재 조사 조합에 대한 처리 방침을 선택하십시오.";
    } else {
      els.status.textContent = `계획 구성 완료 · 자원 ${remaining} · 위험 ${risk}`;
    }

    els.count.textContent = `${selected} SELECTED`;
  }

  function renderSummary() {
    const groups = sections
      .map(section => ({
        section,
        choices: selectedInSection(section.id)
      }))
      .filter(group => group.choices.length);

    if (!groups.length) {
      els.summary.innerHTML = '<p class="empty-state">아직 선택된 항목이 없습니다.</p>';
      return;
    }

    els.summary.innerHTML = groups.map(({ section, choices }) => `
      <section class="summary-group">
        <h3>${section.number} / ${section.title}</h3>
        <ul>
          ${choices.map(choice => `<li>${choice.title}</li>`).join("")}
        </ul>
      </section>
    `).join("");
  }

  function finalDirective() {
    return selectedInSection("directive")[0] || null;
  }

  function approachText() {
    if (isSelected("stance_record")) {
      return "기록의 불일치를 출발점으로 삼아, 확정되지 않은 추론과 실제 문서 근거를 분리하는 계획";
    }
    if (isSelected("stance_people")) {
      return "생존자와 팀원의 선택권을 지키면서 증언을 교차 확인하는 계획";
    }
    if (isSelected("stance_field")) {
      return "현장 조건을 다시 검증하되 첫 철수 판단까지 조사 대상으로 포함하는 계획";
    }
    return "아직 재조사 원칙이 정해지지 않은 계획";
  }

  function renderResult() {
    const directive = finalDirective();
    const complete = Boolean(
      selectedInSection("stance").length &&
      selectedClueCount() &&
      selectedActionCount() &&
      directive
    );

    if (!complete) {
      els.resultState.textContent = "계획 미완성";
      els.resultState.classList.remove("result-state-ready");
      els.resultSummary.textContent = "마지막 처리 방침까지 선택하면 현재 조합에 맞춘 재조사 계획이 생성됩니다.";
      els.resultNotes.innerHTML = "";
      return;
    }

    const clueTitles = selectedInSection("clues").map(choice => choice.title);
    const actionTitles = selectedInSection("actions").map(choice => choice.title);
    const teamTitles = selectedInSection("team").map(choice => choice.title.split(" · ")[0]);
    const risk = riskTotal();

    els.resultState.textContent = directive.title;
    els.resultState.classList.add("result-state-ready");
    els.resultSummary.textContent =
      `${approachText()}으로 정리되었습니다. ${clueTitles.join(", ")}을 핵심 근거로 삼고, ${actionTitles.join(", ")}을 실행 단계에 포함합니다. 최종 방침은 ‘${directive.title}’입니다.`;

    const notes = [];
    if (teamTitles.length) {
      notes.push(`재검토 참여: ${teamTitles.join(", ")}.`);
    } else {
      notes.push("추가 참여 인원 없이 라이카 단독 검토로 시작합니다.");
    }

    if (risk >= 5) {
      notes.push("노출 위험이 매우 높습니다. 계획 실행 전 중단 기준과 철수 조건을 별도 문서화해야 합니다.");
    } else if (risk >= 3) {
      notes.push("현장 또는 신호 노출 위험이 포함됩니다. 제한된 단계 실행이 적합합니다.");
    } else {
      notes.push("현재 구성은 기록·증언 중심이며 직접 노출 위험이 낮습니다.");
    }

    if (isSelected("team_felisette")) {
      notes.push("펠리세트의 참여로 허가·책임 범위를 공식 기록에 남길 수 있습니다.");
    }
    if (isSelected("team_avrek")) {
      notes.push("아브레크의 중단 권한을 재진입 조건에 포함합니다.");
    }
    if (isSelected("team_dochika")) {
      notes.push("도치카의 최초 불일치 보고를 결론이 아닌 검증 출발점으로 유지합니다.");
    }

    els.resultNotes.innerHTML = notes.map(note => `<li>${note}</li>`).join("");
  }

  function buildReportText() {
    const lines = [
      "ERAC / 미종결 기록 — 재조사 계획",
      "================================",
      `조사 자원: ${resourceRemaining()} / ${BASE_RESOURCE}`,
      `노출 위험: ${riskTotal()} / ${RISK_CAP}`,
      ""
    ];

    sections.forEach(section => {
      const selected = selectedInSection(section.id);
      if (!selected.length) return;
      lines.push(`[${section.number}] ${section.title}`);
      selected.forEach(choice => lines.push(`- ${choice.title}`));
      lines.push("");
    });

    const directive = finalDirective();
    if (directive) {
      lines.push("요약");
      lines.push(els.resultSummary.textContent.trim());
    }

    lines.push("");
    lines.push("※ 이 재구성은 사건의 정식 진상이나 정사를 확정하지 않습니다.");
    return lines.join("\n");
  }

  async function copyReport() {
    const text = buildReportText();
    try {
      await navigator.clipboard.writeText(text);
      els.copy.textContent = "복사됨";
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      els.copy.textContent = "복사됨";
    }
    window.setTimeout(() => {
      els.copy.textContent = "보고서 복사";
    }, 1500);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selected]));
    } catch {
      // Storage is optional; the CYOA still works without it.
    }
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        saved.filter(id => choiceMap.has(id)).forEach(id => state.selected.add(id));
        sanitizeSelections();
      }
    } catch {
      state.selected.clear();
    }
  }

  function resetAll() {
    state.selected.clear();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
    render();
    document.querySelector("#choice-sections").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    renderSections();
    renderStatus();
    renderSummary();
    renderResult();
  }

  document.querySelector("#reset-top").addEventListener("click", resetAll);
  document.querySelector("#reset-side").addEventListener("click", resetAll);
  document.querySelector("#copy-report").addEventListener("click", copyReport);

  restore();
  render();
})();
