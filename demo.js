const page = document.body.dataset.demoPage || "overview";
const pageLabel = document.body.dataset.demoLabel || "Business Control Console demo";
const isPortuguese = document.documentElement.lang.startsWith("pt");
const stateKey = `roupico-console-demo:${page}`;

const feedbackMessages = {
  overview: "Hi Bernardo, I’ve tried the Roupiço Business Control Console demo. I currently manage these tasks across separate tools:",
  trades: "Hi Bernardo, I’ve tried the Roupiço Trades Control Console demo. I currently manage these tasks across separate tools:",
  salon: "Hi Bernardo, I’ve tried the Roupiço Salon Control Console demo. I currently manage these tasks across separate tools:",
  safety: "Hi Bernardo, I’ve tried the Roupiço H&S Admin Control Console demo. I currently manage these tasks across separate tools:",
  "pt-overview": "Olá Bernardo, vi as demonstrações da Consola de Gestão da Roupiço e gostaria de partilhar algum feedback:",
  realestate: "Olá Bernardo, experimentei a Consola Imobiliária da Roupiço. Atualmente, faço a gestão destas tarefas em ferramentas separadas:",
};

const getState = () => {
  try { return JSON.parse(sessionStorage.getItem(stateKey) || "{}"); }
  catch { return {}; }
};

const saveState = (next) => {
  try { sessionStorage.setItem(stateKey, JSON.stringify(next)); }
  catch { /* The demo still works if browser storage is unavailable. */ }
};

// WhatsApp feedback links: direct, page-aware and deliberately simple.
const whatsappUrl = `https://wa.me/447391609957?text=${encodeURIComponent(feedbackMessages[page] || feedbackMessages.overview)}`;
document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${link.textContent.trim()} (${isPortuguese ? "abre num novo separador" : "opens in a new tab"})`);
});

if (!document.body.hasAttribute("data-inline-conversion")) {
  const floatingFeedback = document.createElement("a");
  floatingFeedback.className = "floating-feedback whatsapp-link";
  floatingFeedback.href = whatsappUrl;
  floatingFeedback.target = "_blank";
  floatingFeedback.rel = "noopener noreferrer";
  floatingFeedback.textContent = isPortuguese ? "Opinião no WhatsApp" : "Share feedback";
  floatingFeedback.setAttribute("aria-label", `${floatingFeedback.textContent} (${isPortuguese ? "abre num novo separador" : "opens in a new tab"})`);
  document.body.append(floatingFeedback);
}

// Compact, keyboard-safe demo menu. Desktop keeps the links visible.
const nav = document.querySelector(".top-links");
if (nav) {
  nav.id = "demo-navigation";
  nav.classList.add("nav-menu");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "nav-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", nav.id);
  toggle.textContent = isPortuguese ? "Demos" : "Demos";
  nav.before(toggle);

  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && event.target !== toggle) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
}

// Accessible tab behaviour, including Arrow/Home/End keyboard controls.
const activateTab = (group, target, focus = false) => {
  const buttons = Array.from(group.querySelectorAll("[data-tab-target]"));
  const panels = Array.from(group.querySelectorAll("[data-tab-panel]"));
  buttons.forEach((button) => {
    const active = button.dataset.tabTarget === target;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  panels.forEach((panel) => {
    const active = panel.dataset.tabPanel === target;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
};

document.querySelectorAll("[data-demo-tabs]").forEach((group, groupIndex) => {
  const buttons = Array.from(group.querySelectorAll("[data-tab-target]"));
  const panels = Array.from(group.querySelectorAll("[data-tab-panel]"));
  buttons.forEach((button, index) => {
    const target = button.dataset.tabTarget;
    const panel = panels.find((item) => item.dataset.tabPanel === target);
    const tabId = `demo-${groupIndex}-tab-${target}`;
    const panelId = `demo-${groupIndex}-panel-${target}`;
    button.id = tabId;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panelId);
    button.tabIndex = index === 0 ? 0 : -1;
    if (panel) {
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
    }
    button.addEventListener("click", () => activateTab(group, target));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = buttons.length - 1;
      activateTab(group, buttons[next].dataset.tabTarget, true);
    });
  });
});

// Toast feedback for simulated actions.
const toast = document.createElement("div");
toast.className = "demo-toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.append(toast);
let toastTimer;
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
};

const markActionDone = (button, persist = true) => {
  const action = button.dataset.demoAction;
  if (!action) return;
  if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();
  const doneText = button.dataset.actionDone || (isPortuguese ? "Concluído ✓" : "Completed ✓");
  button.textContent = doneText;
  button.classList.add("action-complete");
  button.disabled = true;
  const status = document.querySelector(`[data-action-status="${action}"]`);
  if (status) {
    if (!status.dataset.originalText) status.dataset.originalText = status.textContent.trim();
    status.textContent = isPortuguese ? "concluído" : "done";
    status.classList.remove("warn");
    status.classList.add("good");
  }
  if (persist) {
    const current = getState();
    current[action] = true;
    saveState(current);
    showToast(`${doneText} · ${isPortuguese ? "ação simulada" : "simulated action"}`);
  }
};

document.querySelectorAll("[data-demo-action]").forEach((button) => {
  button.addEventListener("click", () => markActionDone(button));
  if (getState()[button.dataset.demoAction]) markActionDone(button, false);
});

document.querySelectorAll("[data-demo-reset]").forEach((button) => {
  button.addEventListener("click", () => {
    try { sessionStorage.removeItem(stateKey); } catch { /* no-op */ }
    window.location.href = window.location.pathname;
  });
});

// Salon client records and search.
const salonClientRecords = [
  { name: "Mia R.", type: "Colour client", status: "reply due", notes: "Warm brunette, patch test due before lightening.", preferences: "Evening slots, low-maintenance finish.", message: "Asked whether a consultation is needed before booking balayage.", action: "Reply with the consultation slot and patch-test reminder.", reply: "Hi Mia, yes, a quick consultation is best before booking balayage so we can check your hair history and patch-test timing. We have space Thursday evening if that suits.", button: "Reply", keywords: "mia colour brunette patch test lightening balayage consultation evening" },
  { name: "Aisha P.", type: "Regular cut", status: "ready", notes: "Fine hair, prefers soft layers and no heavy product.", preferences: "Saturday mornings, WhatsApp reminders.", message: "Due her usual six-week rebook reminder.", action: "Send a short WhatsApp reminder with two appointment options.", reply: "Hi Aisha, you are around six weeks from your last cut. We have Saturday morning spaces at 10:00 or 11:30 if you would like me to hold one.", button: "Reply", keywords: "aisha regular cut fine hair layers saturday whatsapp six week rebook" },
  { name: "Laura C.", type: "Bridal enquiry", status: "date to hold", notes: "Trial photos received, allergy note attached.", preferences: "Email package details, hold late July.", message: "Asked for package details and Saturday availability.", action: "Reply with package details and confirm whether to hold the trial date.", reply: "Hi Laura, I have your trial photos and allergy note. I can send the bridal package over now and hold the late July trial date until tomorrow evening.", button: "Reply", keywords: "laura bridal enquiry trial photos allergy package email july saturday" },
];

const clientSearch = document.querySelector("[data-client-search]");
if (clientSearch) {
  const fields = Object.fromEntries(["name", "type", "status", "notes", "preferences", "message", "action", "reply", "primary"].map((key) => [key, document.querySelector(`[data-client-${key}]`)]));
  const actionButton = document.querySelector("[data-client-action-button]");
  [fields.primary, actionButton].filter(Boolean).forEach((button) => {
    button.dataset.demoAction = "client-reply";
    button.dataset.actionDone = "Reply approved ✓";
    button.addEventListener("click", () => markActionDone(button));
  });
  const renderClient = (record) => {
    Object.entries({ name: record.name, type: record.type, status: record.status, notes: record.notes, preferences: record.preferences, message: record.message, action: record.action, reply: record.reply, primary: record.button }).forEach(([key, value]) => { if (fields[key]) fields[key].textContent = value; });
    if (actionButton) actionButton.textContent = record.button;
  };
  clientSearch.addEventListener("input", () => {
    const query = clientSearch.value.trim().toLowerCase();
    renderClient(salonClientRecords.find((record) => `${record.name} ${record.type} ${record.keywords}`.toLowerCase().includes(query)) || salonClientRecords[0]);
  });
}

// Real-estate listing search.
const listingSearch = document.querySelector("[data-listing-search]");
if (listingSearch) {
  const listings = Array.from(document.querySelectorAll("[data-listing]"));
  const empty = document.querySelector("[data-listing-empty]");
  const count = document.querySelector("[data-listing-count]");
  listingSearch.addEventListener("input", () => {
    const query = listingSearch.value.trim().toLowerCase();
    let visible = 0;
    listings.forEach((listing) => {
      const match = `${listing.textContent} ${listing.dataset.listingKeywords || ""}`.toLowerCase().includes(query);
      listing.hidden = !match;
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = `${visible} ${visible === 1 ? "imóvel" : "imóveis"}`;
  });
}

// Real-estate email preview and simulated send.
const emailItems = Array.from(document.querySelectorAll("[data-email-pick]"));
if (emailItems.length) {
  const templates = [
    ["antonio.almeida@email.pt", "Confirmação da visita — T3 em Cascais (ref. LC-204)", "Exmo. Sr. Almeida,\n\nConfirmo a nossa visita de hoje, às 15:00, ao T3 em Cascais (ref. LC-204). A morada é Rua das Flores, 24, e estarei no local cinco minutos antes.\n\nEnvio em anexo a ficha do imóvel, com fotografias e plantas. Caso surja algum imprevisto, agradeço que me informe.\n\nCom os melhores cumprimentos,\nInês Costa — Costa Lima Mediação Imobiliária"],
    ["sofia.pereira@email.pt", "Detalhes do T2 em Oeiras (ref. LC-198)", "Exma. Sra. Pereira,\n\nConforme combinado, envio os detalhes do T2 em Oeiras (ref. LC-198): 78 m², 2.º andar com elevador, lugar de garagem e arrecadação. Valor de 295.000 €.\n\nSegue em anexo a ficha completa, com fotografias e planta. Se for do seu agrado, posso agendar uma visita esta semana.\n\nCom os melhores cumprimentos,\nInês Costa — Costa Lima Mediação Imobiliária"],
    ["familia.martins@email.pt", "Seguimento da visita — T1 em Lisboa (ref. LC-187)", "Exmos. Senhores Martins,\n\nAgradeço a vossa visita de ontem ao T1 na Estrela (ref. LC-187). Gostaria de saber a vossa impressão e se há alguma questão que possa esclarecer.\n\nCaso pretendam avançar, posso preparar uma simulação de condições. Fico ao vosso inteiro dispor.\n\nCom os melhores cumprimentos,\nInês Costa — Costa Lima Mediação Imobiliária"],
    ["rui.nunes@email.pt", "Proposta recebida — Moradia T4 em Sintra (ref. LC-176)", "Exmo. Sr. Nunes,\n\nRecebemos uma proposta para a moradia T4 em Sintra (ref. LC-176) e gostaria de a apresentar pessoalmente, bem como os próximos passos até ao CPCV.\n\nTem disponibilidade para uma reunião amanhã de manhã ou ao início da tarde?\n\nCom os melhores cumprimentos,\nInês Costa — Costa Lima Mediação Imobiliária"],
  ];
  const to = document.querySelector("[data-email-to]");
  const subject = document.querySelector("[data-email-subject]");
  const body = document.querySelector("[data-email-body]");
  const status = document.querySelector("[data-email-status]");
  const sent = document.querySelector("[data-email-sent]");
  const send = document.querySelector("[data-email-send]");
  const render = (template) => { if (to) to.textContent = template[0]; if (subject) subject.textContent = template[1]; if (body) body.textContent = template[2]; if (sent) sent.hidden = true; if (status) { status.textContent = "rascunho"; status.className = "status-pill warn"; } if (send) { send.textContent = "Enviar email"; send.disabled = false; } };
  emailItems.forEach((item) => item.addEventListener("click", () => { emailItems.forEach((other) => { const active = other === item; other.classList.toggle("active", active); other.setAttribute("aria-selected", String(active)); }); render(templates[Number(item.dataset.emailPick)] || templates[0]); }));
  if (send) send.addEventListener("click", () => { if (sent) sent.hidden = false; if (status) { status.textContent = "enviado"; status.className = "status-pill good"; } send.textContent = "Enviado ✓"; send.disabled = true; showToast("Email assinalado como enviado · ação simulada"); });
}

// Reusable, inline journey model for the new self-guided flagship pattern.
// Later sector demos can supply another configuration without changing the state logic.
const journeyConfigs = {
  trades: {
    stages: [
      {
        label: "Step 1 of 4 · Review",
        control: "Human decision",
        title: "Review the new fence-repair enquiry.",
        copy: "The customer supplied a postcode, photos and preferred week. Review the useful details before preparing anything.",
        facts: [["Customer", "Jordan M."], ["Request", "Replace two damaged fence panels"], ["Area", "Sheerness · ME12"], ["Evidence", "2 photos attached"]],
        next: "A sample quote moves into the approval queue. It still cannot be sent.",
        action: "Prepare sample quote",
        metrics: { enquiries: [5, "One ready to review"], jobs: [8, "Three on site today"], approvals: [3, "Nothing sends automatically"] },
        workload: { urgent: 3, today: 5, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"]],
      },
      {
        label: "Step 2 of 4 · Approve",
        control: "Approval required",
        title: "Check the prepared sample quote.",
        copy: "Details sit beside a fictional scope and price. Review them before the quote moves forward.",
        facts: [["Customer", "Jordan M."], ["Scope", "Two panels · remove and replace"], ["Sample price", "£480 including materials"], ["Status", "Draft only · not sent"]],
        next: "Approval marks the quote ready and reveals the booking step.",
        action: "Approve sample quote",
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [8, "Three on site today"], approvals: [4, "Sample quote added"] },
        workload: { urgent: 3, today: 5, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Waiting for human approval"]],
      },
      {
        label: "Step 3 of 4 · Book",
        control: "Schedule decision",
        title: "Choose the sample site-visit slot.",
        copy: "The quote is approved inside this demo. Select the suggested visit so the work and customer update stay aligned.",
        facts: [["Quote", "Approved in this demo"], ["Suggested", "Thursday · 10:30"], ["Alternative", "Friday · 13:00"], ["Visit length", "45 minutes"]],
        next: "Booking the visit prepares a customer confirmation for review.",
        action: "Book Thursday at 10:30",
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [8, "Visit ready to book"], approvals: [3, "Quote decision recorded"] },
        workload: { urgent: 2, today: 6, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Scope and price brought together"], ["08:49", "Sample quote approved", "Decision recorded in the demo"]],
      },
      {
        label: "Step 4 of 4 · Update",
        control: "Customer-facing review",
        title: "Review the customer update.",
        copy: "The visit is on the fictional schedule. Check the prepared confirmation before recording the final approval.",
        facts: [["Recipient", "Jordan M."], ["Visit", "Thursday · 10:30"], ["Channel", "WhatsApp draft"], ["Send rule", "Approval required"]],
        next: "Approval records the decision. No real message is sent.",
        action: "Approve simulated update",
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [9, "Sample visit now included"], approvals: [4, "Customer update waiting"] },
        workload: { urgent: 2, today: 5, track: 9 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Scope and price brought together"], ["08:49", "Sample quote approved", "Decision recorded in the demo"], ["08:51", "Sample visit booked", "Thursday at 10:30"]],
      },
      {
        label: "Four-step example complete",
        control: "All decisions recorded",
        title: "The enquiry is ready for the next working day.",
        copy: "The fictional quote, visit and customer update now share one visible decision trail. Nothing left this browser.",
        facts: [["Enquiry", "Reviewed"], ["Quote", "Approved in the demo"], ["Visit", "Thursday · 10:30"], ["Update", "Approved · not sent"]],
        next: "Explore the wider example or discuss the workflow you actually use.",
        action: null,
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [9, "Sample visit now included"], approvals: [3, "Update decision recorded"] },
        workload: { urgent: 1, today: 6, track: 9 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Scope and price brought together"], ["08:49", "Sample quote approved", "Decision recorded in the demo"], ["08:51", "Sample visit booked", "Thursday at 10:30"], ["08:53", "Customer update approved", "Simulated action · nothing sent"]],
      },
    ],
  },
  salon: {
    stages: [
      {
        label: "Step 1 of 4 · Review",
        control: "Human decision",
        title: "Review the new colour enquiry.",
        copy: "Mia shared her preferred result, availability and colour history. Check the useful details before preparing a reply.",
        facts: [["Client", "Mia R."], ["Request", "Balayage consultation"], ["Preference", "Low-maintenance brunette"], ["Availability", "Thursday evening"]],
        next: "A consultation reply moves into the approval queue. It still cannot be sent.",
        action: "Prepare consultation reply",
        metrics: { enquiries: [7, "One ready to review"], bookings: [12, "Two useful gaps remain"], approvals: [3, "Nothing sends automatically"] },
        workload: { urgent: 3, today: 6, track: 9 },
        activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"]],
      },
      {
        label: "Step 2 of 4 · Approve",
        control: "Approval required",
        title: "Check the prepared consultation reply.",
        copy: "The draft explains the consultation and patch-test requirement. Review the wording before the enquiry moves forward.",
        facts: [["Client", "Mia R."], ["Suggested slot", "Thursday · 18:00"], ["Preparation", "Consultation and patch test"], ["Status", "Draft only · not sent"]],
        next: "Approval makes the consultation slot available to book inside this demo.",
        action: "Approve sample reply",
        metrics: { enquiries: [6, "Reviewed and organised"], bookings: [12, "Two useful gaps remain"], approvals: [4, "Consultation reply added"] },
        workload: { urgent: 3, today: 6, track: 9 },
        activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Waiting for human approval"]],
      },
      {
        label: "Step 3 of 4 · Book",
        control: "Schedule decision",
        title: "Book the sample consultation.",
        copy: "The reply is approved inside this demo. Select the suggested slot so the client context and appointment stay aligned.",
        facts: [["Reply", "Approved in this demo"], ["Suggested", "Thursday · 18:00"], ["Service", "Colour consultation"], ["Duration", "30 minutes"]],
        next: "Booking the consultation prepares an appointment confirmation for review.",
        action: "Book Thursday at 18:00",
        metrics: { enquiries: [6, "Reviewed and organised"], bookings: [12, "Consultation ready to book"], approvals: [3, "Reply decision recorded"] },
        workload: { urgent: 2, today: 7, track: 9 },
        activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Client context brought together"], ["09:12", "Sample reply approved", "Decision recorded in the demo"]],
      },
      {
        label: "Step 4 of 4 · Update",
        control: "Client-facing review",
        title: "Review the appointment confirmation.",
        copy: "The consultation is on the fictional schedule. Check the prepared confirmation before recording the final approval.",
        facts: [["Client", "Mia R."], ["Appointment", "Thursday · 18:00"], ["Reminder", "Patch-test timing included"], ["Send rule", "Approval required"]],
        next: "Approval records the decision. No real message is sent.",
        action: "Approve simulated confirmation",
        metrics: { enquiries: [6, "Reviewed and organised"], bookings: [13, "Sample consultation included"], approvals: [4, "Confirmation waiting"] },
        workload: { urgent: 2, today: 6, track: 10 },
        activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Client context brought together"], ["09:12", "Sample reply approved", "Decision recorded in the demo"], ["09:14", "Consultation booked", "Thursday at 18:00"]],
      },
      {
        label: "Four-step example complete",
        control: "All decisions recorded",
        title: "The client enquiry is ready for the next working day.",
        copy: "The fictional reply, consultation and confirmation now share one visible decision trail. Nothing left this browser.",
        facts: [["Enquiry", "Reviewed"], ["Reply", "Approved in the demo"], ["Consultation", "Thursday · 18:00"], ["Confirmation", "Approved · not sent"]],
        next: "Explore the wider example or discuss the workflow your salon actually uses.",
        action: null,
        metrics: { enquiries: [6, "Reviewed and organised"], bookings: [13, "Sample consultation included"], approvals: [3, "Confirmation decision recorded"] },
        workload: { urgent: 1, today: 7, track: 10 },
        activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Client context brought together"], ["09:12", "Sample reply approved", "Decision recorded in the demo"], ["09:14", "Consultation booked", "Thursday at 18:00"], ["09:16", "Confirmation approved", "Simulated action · nothing sent"]],
      },
    ],
  },
  safety: {
    stages: [
      {
        label: "Step 1 of 4 · Review",
        control: "Admin decision",
        title: "Review the new inspection enquiry.",
        copy: "The client supplied a site type, preferred week and contact. Check the admin details without making any technical assessment.",
        facts: [["Client", "North Quay Storage"], ["Request", "Warehouse inspection"], ["Site", "Single-storey unit"], ["Boundary", "Admin triage only"]],
        next: "A request for missing scope details is prepared. It still cannot be sent.",
        action: "Prepare scope questions",
        metrics: { enquiries: [6, "Two need clarification"], visits: [4, "Access notes checked"], reviews: [5, "Qualified decision required"] },
        workload: { urgent: 4, today: 6, track: 10 },
        activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"]],
      },
      {
        label: "Step 2 of 4 · Clarify",
        control: "Approval required",
        title: "Check the prepared scope questions.",
        copy: "The draft asks only for activity, access and timing details. It gives no safety advice and still needs approval.",
        facts: [["Missing", "Work activity summary"], ["Access", "Visitor induction details"], ["Timing", "Preferred inspection week"], ["Boundary", "No technical advice"]],
        next: "Approval records the clarification and reveals a provisional visit slot.",
        action: "Approve scope request",
        metrics: { enquiries: [5, "One clarification organised"], visits: [4, "Access notes checked"], reviews: [6, "Scope request added"] },
        workload: { urgent: 4, today: 6, track: 10 },
        activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"], ["08:24", "Scope questions prepared", "Waiting for admin approval"]],
      },
      {
        label: "Step 3 of 4 · Book",
        control: "Schedule decision",
        title: "Book the provisional inspection.",
        copy: "The fictional client details are complete. Select the suggested slot while keeping technical assessment with the assigned advisor.",
        facts: [["Scope", "Admin details complete"], ["Suggested", "Tuesday · 10:30"], ["Advisor", "Competent person assigned"], ["Access", "Induction at reception"]],
        next: "Booking the visit creates an administrative review pack for the advisor.",
        action: "Book Tuesday at 10:30",
        metrics: { enquiries: [5, "Clarification organised"], visits: [4, "Inspection ready to book"], reviews: [5, "Admin decision recorded"] },
        workload: { urgent: 3, today: 7, track: 10 },
        activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"], ["08:24", "Scope questions prepared", "Administrative details only"], ["08:27", "Scope request approved", "Decision recorded in the demo"]],
      },
      {
        label: "Step 4 of 4 · Route",
        control: "Professional boundary",
        title: "Route the pack for competent-person review.",
        copy: "The visit is on the fictional schedule. Confirm ownership without approving advice, findings or regulated documents.",
        facts: [["Visit", "Tuesday · 10:30"], ["Pack", "Scope, access and contact details"], ["Reviewer", "Assigned competent person"], ["Boundary", "Professional judgement required"]],
        next: "Routing records ownership. It does not create or approve safety advice.",
        action: "Route for professional review",
        metrics: { enquiries: [5, "Clarification organised"], visits: [5, "Sample inspection included"], reviews: [6, "Review pack waiting"] },
        workload: { urgent: 3, today: 6, track: 11 },
        activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"], ["08:24", "Scope questions prepared", "Administrative details only"], ["08:27", "Scope request approved", "Decision recorded in the demo"], ["08:31", "Inspection booked", "Tuesday at 10:30"]],
      },
      {
        label: "Four-step example complete",
        control: "Professional review required",
        title: "The enquiry is ready for qualified review.",
        copy: "The fictional scope, visit and ownership trail are visible. No technical judgement or regulated document was produced.",
        facts: [["Enquiry", "Admin-reviewed"], ["Scope", "Clarified in the demo"], ["Visit", "Tuesday · 10:30"], ["Review", "Assigned · not completed"]],
        next: "Explore the wider example or discuss the administrative workflow you actually use.",
        action: null,
        metrics: { enquiries: [5, "Clarification organised"], visits: [5, "Sample inspection included"], reviews: [6, "Qualified review still required"] },
        workload: { urgent: 2, today: 7, track: 11 },
        activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"], ["08:24", "Scope questions prepared", "Administrative details only"], ["08:27", "Scope request approved", "Decision recorded in the demo"], ["08:31", "Inspection booked", "Tuesday at 10:30"], ["08:34", "Review pack assigned", "Competent-person decision still required"]],
      },
    ],
  },
  realestate: {
    ui: {
      workload: ({ urgent, today, track }) => `Trabalho de exemplo: ${urgent} urgentes, ${today} para hoje e ${track} controlados`,
      completeAnnouncement: "Exemplo concluído. As quatro decisões simuladas ficaram registadas.",
      completeToast: "Exemplo concluído · nada foi enviado",
      stepToast: (step) => `Passo ${step} concluído · ação simulada`,
      explore: "Explorar o painel completo",
      hideExplore: "Ocultar o painel completo",
    },
    stages: [
      {
        label: "Passo 1 de 4 · Analisar",
        control: "Decisão humana",
        title: "Analise o novo pedido de visita.",
        copy: "O contacto indicou o imóvel, o horário preferido e uma questão. Confirme os dados úteis antes de preparar a resposta.",
        facts: [["Contacto", "António Almeida"], ["Imóvel", "LC-204 · T3 Cascais"], ["Preferência", "Quinta-feira depois das 15h"], ["Origem", "Idealista · registo fictício"]],
        next: "Uma resposta fica preparada para aprovação. Ainda não pode ser enviada.",
        action: "Preparar resposta",
        metrics: { leads: [8, "Um pronto para analisar"], visits: [3, "Duas em Cascais"], approvals: [4, "Nada é enviado automaticamente"] },
        workload: { urgent: 3, today: 6, track: 9 },
        activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"]],
      },
      {
        label: "Passo 2 de 4 · Aprovar",
        control: "Aprovação necessária",
        title: "Reveja a resposta preparada.",
        copy: "O rascunho confirma o imóvel e propõe dois horários. Reveja o texto antes de o contacto avançar.",
        facts: [["Contacto", "António Almeida"], ["Imóvel", "LC-204 · T3 Cascais"], ["Opções", "Quinta 15h ou 16h30"], ["Estado", "Rascunho · não enviado"]],
        next: "A aprovação disponibiliza o horário sugerido para marcação nesta demonstração.",
        action: "Aprovar resposta de exemplo",
        metrics: { leads: [7, "Contacto analisado"], visits: [3, "Duas em Cascais"], approvals: [5, "Resposta adicionada"] },
        workload: { urgent: 3, today: 6, track: 9 },
        activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"], ["09:16", "Resposta preparada", "A aguardar aprovação humana"]],
      },
      {
        label: "Passo 3 de 4 · Marcar",
        control: "Decisão de agenda",
        title: "Marque a visita de exemplo.",
        copy: "A resposta foi aprovada nesta demonstração. Escolha o horário sugerido para manter o contacto e o imóvel ligados.",
        facts: [["Resposta", "Aprovada nesta demonstração"], ["Sugerido", "Quinta-feira · 15:00"], ["Imóvel", "LC-204 · T3 Cascais"], ["Duração", "45 minutos"]],
        next: "A marcação prepara uma confirmação para revisão do agente.",
        action: "Marcar quinta-feira às 15:00",
        metrics: { leads: [7, "Contacto analisado"], visits: [3, "Visita pronta para marcar"], approvals: [4, "Decisão registada"] },
        workload: { urgent: 2, today: 7, track: 9 },
        activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"], ["09:16", "Resposta preparada", "Contacto e imóvel reunidos"], ["09:18", "Resposta aprovada", "Decisão registada na demonstração"]],
      },
      {
        label: "Passo 4 de 4 · Confirmar",
        control: "Revisão dirigida ao cliente",
        title: "Reveja a confirmação da visita.",
        copy: "A visita está na agenda fictícia. Confirme o destinatário, imóvel e horário antes de registar a aprovação final.",
        facts: [["Destinatário", "António Almeida"], ["Visita", "Quinta-feira · 15:00"], ["Imóvel", "LC-204 · T3 Cascais"], ["Regra", "Aprovação necessária"]],
        next: "A aprovação regista a decisão. Nenhuma mensagem real é enviada.",
        action: "Aprovar confirmação simulada",
        metrics: { leads: [7, "Contacto analisado"], visits: [4, "Visita de exemplo incluída"], approvals: [5, "Confirmação a aguardar"] },
        workload: { urgent: 2, today: 6, track: 10 },
        activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"], ["09:16", "Resposta preparada", "Contacto e imóvel reunidos"], ["09:18", "Resposta aprovada", "Decisão registada na demonstração"], ["09:20", "Visita marcada", "Quinta-feira às 15:00"]],
      },
      {
        label: "Exemplo de quatro passos concluído",
        control: "Todas as decisões registadas",
        title: "O pedido de visita está pronto para o próximo dia de trabalho.",
        copy: "A resposta, visita e confirmação fictícias partilham agora um histórico visível. Nada saiu deste navegador.",
        facts: [["Contacto", "Analisado"], ["Resposta", "Aprovada na demonstração"], ["Visita", "Quinta-feira · 15:00"], ["Confirmação", "Aprovada · não enviada"]],
        next: "Explore o exemplo completo ou fale connosco sobre o processo que realmente utiliza.",
        action: null,
        metrics: { leads: [7, "Contacto analisado"], visits: [4, "Visita de exemplo incluída"], approvals: [4, "Decisão final registada"] },
        workload: { urgent: 1, today: 7, track: 10 },
        activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"], ["09:16", "Resposta preparada", "Contacto e imóvel reunidos"], ["09:18", "Resposta aprovada", "Decisão registada na demonstração"], ["09:20", "Visita marcada", "Quinta-feira às 15:00"], ["09:22", "Confirmação aprovada", "Ação simulada · nada enviado"]],
      },
    ],
  },
};

const journeyRoot = document.querySelector("[data-flagship-journey]");
if (journeyRoot) {
  const config = journeyConfigs[journeyRoot.dataset.scenario];
  const journeyUi = {
    workload: ({ urgent, today, track }) => `Example workload: ${urgent} urgent, ${today} due today and ${track} on track`,
    completeAnnouncement: "Example complete. All four simulated decisions are recorded.",
    completeToast: "Example complete · nothing was sent",
    stepToast: (step) => `Step ${step} completed · simulated action`,
    explore: "Explore the wider dashboard",
    hideExplore: "Hide the wider dashboard",
    ...config.ui,
  };
  const stepLabel = journeyRoot.querySelector("[data-step-label]");
  const stepControl = journeyRoot.querySelector("[data-step-control]");
  const stepTitle = journeyRoot.querySelector("[data-step-title]");
  const stepCopy = journeyRoot.querySelector("[data-step-copy]");
  const stepFacts = journeyRoot.querySelector("[data-step-facts]");
  const stepNext = journeyRoot.querySelector("[data-step-next]");
  const actionButton = journeyRoot.querySelector("[data-journey-action]");
  const resetButton = journeyRoot.querySelector("[data-journey-reset]");
  const statusMessage = journeyRoot.querySelector("[data-journey-status]");
  const activityList = journeyRoot.querySelector("[data-activity-list]");
  const ring = journeyRoot.querySelector("[data-workload-ring]");
  const completePanel = journeyRoot.querySelector("[data-journey-complete]");
  const conversionPanel = document.querySelector("[data-conversion-panel]");
  const exploreButton = journeyRoot.querySelector("[data-explore-toggle]");
  const fullExample = journeyRoot.querySelector("[data-full-example]");
  const storedStep = Number(getState().journeyStep);
  let journeyStep = Number.isInteger(storedStep) ? Math.max(0, Math.min(storedStep, config.stages.length - 1)) : 0;

  const renderPairs = (container, pairs, termTag, detailTag) => {
    container.textContent = "";
    pairs.forEach(([term, detail]) => {
      const wrapper = document.createElement("div");
      const termNode = document.createElement(termTag);
      const detailNode = document.createElement(detailTag);
      termNode.textContent = term;
      detailNode.textContent = detail;
      wrapper.append(termNode, detailNode);
      container.append(wrapper);
    });
  };

  const renderJourney = (announce = false) => {
    const state = config.stages[journeyStep];
    stepLabel.textContent = state.label;
    stepControl.textContent = state.control;
    stepTitle.textContent = state.title;
    stepCopy.textContent = state.copy;
    stepNext.textContent = state.next;
    renderPairs(stepFacts, state.facts, "dt", "dd");

    Object.entries(state.metrics).forEach(([key, [value, note]]) => {
      journeyRoot.querySelector(`[data-metric-value="${key}"]`).textContent = value;
      journeyRoot.querySelector(`[data-metric-note="${key}"]`).textContent = note;
    });

    journeyRoot.querySelectorAll("[data-pipeline-step]").forEach((item) => {
      const index = Number(item.dataset.pipelineStep);
      item.classList.toggle("complete", journeyStep > index);
      item.classList.toggle("active", journeyStep === index);
      if (journeyStep === index) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    const total = state.workload.urgent + state.workload.today + state.workload.track;
    const urgentEnd = state.workload.urgent / total * 360;
    const todayEnd = urgentEnd + state.workload.today / total * 360;
    ring.style.setProperty("--urgent-end", `${urgentEnd}deg`);
    ring.style.setProperty("--today-end", `${todayEnd}deg`);
    ring.setAttribute("aria-label", journeyUi.workload(state.workload));
    journeyRoot.querySelector("[data-workload-total]").textContent = total;
    Object.entries(state.workload).forEach(([key, value]) => { journeyRoot.querySelector(`[data-workload-value="${key}"]`).textContent = value; });

    activityList.textContent = "";
    state.activities.slice().reverse().forEach(([time, title, detail]) => {
      const item = document.createElement("li");
      const timeNode = document.createElement("span");
      const copyNode = document.createElement("p");
      const titleNode = document.createElement("strong");
      const detailNode = document.createElement("small");
      timeNode.textContent = time;
      titleNode.textContent = title;
      detailNode.textContent = detail;
      copyNode.append(titleNode, detailNode);
      item.append(timeNode, copyNode);
      activityList.append(item);
    });

    const finished = journeyStep === config.stages.length - 1;
    actionButton.hidden = finished;
    actionButton.textContent = state.action || "";
    completePanel.hidden = !finished;
    conversionPanel.hidden = journeyStep === 0;
    if (announce) statusMessage.textContent = finished ? journeyUi.completeAnnouncement : `${state.label}. ${state.title}`;
  };

  actionButton.addEventListener("click", () => {
    if (journeyStep >= config.stages.length - 1) return;
    journeyStep += 1;
    const current = getState();
    current.journeyStep = journeyStep;
    saveState(current);
    renderJourney(true);
    showToast(journeyStep === config.stages.length - 1 ? journeyUi.completeToast : journeyUi.stepToast(journeyStep));
  });

  resetButton.addEventListener("click", () => {
    journeyStep = 0;
    try { sessionStorage.removeItem(stateKey); } catch { /* no-op */ }
    fullExample.hidden = true;
    exploreButton.setAttribute("aria-expanded", "false");
    exploreButton.textContent = journeyUi.explore;
    renderJourney(true);
    actionButton.focus();
  });

  exploreButton.addEventListener("click", () => {
    const willOpen = fullExample.hidden;
    fullExample.hidden = !willOpen;
    exploreButton.setAttribute("aria-expanded", String(willOpen));
    exploreButton.textContent = willOpen ? journeyUi.hideExplore : journeyUi.explore;
    if (willOpen) journeyRoot.querySelector("#full-example-title").focus({ preventScroll: true });
  });

  renderJourney();

  if (new URLSearchParams(window.location.search).get("tour") === "1") {
    requestAnimationFrame(() => {
      journeyRoot.querySelector(".journey-focus").scrollIntoView({ behavior: "auto", block: "start" });
      if (actionButton.hidden) journeyRoot.querySelector("#journey-title").focus({ preventScroll: true });
      else actionButton.focus({ preventScroll: true });
    });
  }
}

// Clearly identify controls that are visual examples rather than working actions.
document.querySelectorAll("button").forEach((button) => {
  if (button.matches("[data-tab-target], [data-demo-action], [data-demo-reset], [data-tour-start], [data-email-pick], [data-email-send], [data-journey-action], [data-journey-reset], [data-explore-toggle], .nav-toggle")) return;
  button.disabled = true;
  button.classList.add("preview-only");
  button.title = isPortuguese ? "Apenas pré-visualização nesta demonstração" : "Preview only in this concept demo";
  button.setAttribute("aria-label", `${button.textContent.trim()} — ${isPortuguese ? "apenas pré-visualização" : "preview only"}`);
});

// Ten-step spotlight tours: explanation first, then representative actions.
const tourStart = document.querySelector("[data-tour-start]");
if (tourStart) {
  const tradesTourSteps = [
    { tab: "today", target: "customise", title: "1. Start with your business, not a template", copy: "This console is a concept for a tailored control view. The name, colours, terminology, screens, permissions and priority rules can all be shaped around how your team actually works." },
    { tab: "today", target: "metrics", title: "2. Choose the numbers that matter today", copy: "These summary cards could show the measures you use to run the day: new enquiries, active jobs, overdue callbacks, unassigned work or something completely different." },
    { tab: "today", target: "schedule", title: "3. Bring the working day into one view", copy: "The schedule can reflect your own appointment types and working hours. Google Calendar or Outlook Calendar could be connected so visits and admin blocks stay aligned with the calendar your team already uses." },
    { tab: "today", target: "attention", title: "4. Make your real workflow visible", copy: "Quote, Booked, Waiting and Admin are only examples. Your job stages, owners, deadlines and warning rules can be customised so everybody can see what is moving and what is blocked." },
    { tab: "today", target: "followups", title: "5. Turn follow-up into a controlled queue", copy: "The console can flag replies and callbacks based on rules you choose. Connect WhatsApp Business or an email inbox such as Gmail or Outlook to prepare and, after approval, send drafted messages through the channel your customers actually use. Try Complete callback here." },
    { tab: "jobs", target: "pipeline", title: "6. Build the quote stages around your process", copy: "This pipeline could begin with a website form, an email, a phone note or a CRM record. The stages, required information and hand-off rules can match your quoting process rather than forcing a generic sales pipeline." },
    { tab: "jobs", target: "quote", title: "7. Make the next action obvious", copy: "Advance this sample quote to show how one action can update its status and expose the next required information. In a working console, photos, postcode, urgency and access notes could arrive from your connected form, inbox or CRM." },
    { tab: "jobs", target: "update", title: "8. Prepare customer updates without losing control", copy: "Message wording and approval rules can vary by situation and staff role. Connect WhatsApp Business or email to send an approved arrival window through whichever channel you normally use. Nothing customer-facing should leave before the agreed approval step." },
    { tab: "cashflow", target: "cash", title: "9. Bring useful financial signals into view", copy: "This is not accounting software. It can surface the figures and exceptions you need from tools such as Xero, QuickBooks, FreeAgent or Stripe, with the cards and thresholds chosen for your business." },
    { tab: "cashflow", target: "invoice", title: "10. Approve chasers and recurring follow-up", copy: "Invoice chasers, annual service reminders and aftercare notes can follow different timing and tone rules. The console can draft them from connected finance and customer data, then use email or WhatsApp after your approval. Try approving one sample chaser." },
  ];
  const propertyTourSteps = [
    { tab: "hoje", target: "pt-customise", title: "1. Comece pelo seu processo, não por um modelo", copy: "Esta consola é um conceito para uma vista de controlo à medida. O nome, as cores, a linguagem, os ecrãs, as permissões e as regras de prioridade podem ser adaptados à forma como a sua agência realmente trabalha." },
    { tab: "hoje", target: "pt-metrics", title: "2. Escolha os indicadores úteis para cada manhã", copy: "Estes cartões podem mostrar visitas, contactos sem resposta, imóveis a atualizar, propostas em curso ou outros números importantes para a sua equipa. O conteúdo e os alertas são configuráveis." },
    { tab: "hoje", target: "pt-schedule", title: "3. Reúna a agenda de visitas", copy: "A agenda pode refletir os seus tipos de visita, avaliações, reuniões e horários. O Google Calendar ou o Outlook Calendar podem ser ligados para manter a consola alinhada com o calendário que a equipa já utiliza." },
    { tab: "hoje", target: "pt-sources", title: "4. Perceba de onde chegam os contactos", copy: "A origem dos contactos ajuda a organizar o seguimento: Idealista, Imovirtual, Casa SAPO, site, telefone, email ou WhatsApp. A informação pode entrar por integrações autorizadas ou por importações, consoante o que cada serviço permitir." },
    { tab: "hoje", target: "pt-responses", title: "5. Transforme pedidos numa fila controlada", copy: "Os tipos de pedido, a urgência, o responsável e o prazo podem seguir regras próprias. Ligue o WhatsApp Business ou uma caixa de email Gmail, Outlook ou Microsoft 365 para preparar respostas e enviá-las apenas depois da aprovação definida pela agência." },
    { tab: "hoje", target: "pt-followups", title: "6. Não deixe o seguimento escapar", copy: "A consola pode assinalar contactos sem resposta, visitas sem seguimento e anúncios a expirar segundo os prazos que escolher. As filas, responsáveis e lembretes são todos adaptáveis ao seu processo comercial." },
    { tab: "imoveis", target: "pt-portfolio", title: "7. Adapte a carteira de imóveis", copy: "Pode escolher os campos, filtros e estados relevantes: referência, zona, tipologia, preço, dias no mercado, documentação ou responsável. A pesquisa pode trabalhar sobre o seu CRM imobiliário ou outra fonte de dados autorizada." },
    { tab: "imoveis", target: "pt-listings", title: "8. Prepare atualizações dos portais", copy: "A consola pode comparar estados, preços, fotografias e destaques entre a carteira e portais como Idealista, Imovirtual ou Casa SAPO, quando a integração o permitir. As alterações ficam preparadas para confirmação antes de publicar. Experimente concluir a atualização de exemplo." },
    { tab: "email", target: "pt-emails", title: "9. Crie modelos para cada situação", copy: "Os modelos podem variar entre pedidos de visita, envio de detalhes, seguimento pós-visita e propostas. Gmail, Outlook ou Microsoft 365 podem ser ligados para associar cada rascunho ao contacto e ao imóvel certos." },
    { tab: "email", target: "pt-email-preview", title: "10. Reveja e aprove cada envio", copy: "O agente continua a controlar o destinatário, o assunto, os anexos e o texto final. Depois da aprovação, a mensagem pode seguir pela conta de email ligada; nesta demonstração, o botão apenas simula o envio. Experimente Enviar email." },
  ];
  const tourText = isPortuguese ? {
    back: "Anterior",
    skip: "Ignorar visita",
    feedback: "Partilhar opinião no WhatsApp",
    next: "Seguinte",
    finish: "Terminar visita",
    close: "Fechar",
    progress: (step, total) => `Passo ${step} de ${total} · cerca de dois minutos`,
    completeProgress: "Visita concluída · cerca de dois minutos",
    completeTitle: "O seu processo, as suas ligações, as suas regras de aprovação.",
    completeCopy: "A consola pode ser adaptada à informação, aos portais, aos programas e aos canais de contacto que a sua agência já utiliza. Destaca as próximas ações e prepara trabalho de rotina, mantendo as decisões dirigidas ao cliente sob o nível de controlo humano que escolher. O que tornaria este conceito mais útil para a sua agência?",
    completeToast: "Visita concluída · obrigado por explorar a demonstração",
  } : {
    back: "Back",
    skip: "Skip tour",
    feedback: "Share feedback on WhatsApp",
    next: "Next",
    finish: "Finish tour",
    close: "Close",
    progress: (step, total) => `Step ${step} of ${total} · about two minutes total`,
    completeProgress: "Tour complete · about two minutes",
    completeTitle: "Your workflow, your connections, your approval rules.",
    completeCopy: "The console can be shaped around the information, tools and customer channels your business already uses. It surfaces the next actions and prepares routine work while keeping customer-facing decisions under the level of human control you choose. What would make this useful for your business?",
    completeToast: "Tour complete · thank you for taking a look",
  };
  const steps = isPortuguese ? propertyTourSteps : tradesTourSteps;
  let currentStep = 0;
  let tourComplete = false;
  let previousFocus = null;
  const overlay = document.createElement("div");
  overlay.className = "tour-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `<section class="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-title"><p class="tour-progress"></p><h2 id="tour-title"></h2><p class="tour-copy"></p><div class="tour-actions"><button type="button" data-tour-back>${tourText.back}</button><button type="button" data-tour-skip>${tourText.skip}</button><a class="tour-feedback" data-tour-feedback href="#" hidden>${tourText.feedback}</a><button class="primary" type="button" data-tour-next>${tourText.next}</button></div></section>`;
  document.body.append(overlay);
  const dialog = overlay.querySelector(".tour-dialog");
  const title = overlay.querySelector("#tour-title");
  const copy = overlay.querySelector(".tour-copy");
  const progress = overlay.querySelector(".tour-progress");
  const back = overlay.querySelector("[data-tour-back]");
  const next = overlay.querySelector("[data-tour-next]");
  const skip = overlay.querySelector("[data-tour-skip]");
  const tourFeedback = overlay.querySelector("[data-tour-feedback]");
  tourFeedback.href = whatsappUrl;
  tourFeedback.target = "_blank";
  tourFeedback.rel = "noopener noreferrer";

  const clearHighlight = () => document.querySelectorAll(".tour-highlight").forEach((item) => item.classList.remove("tour-highlight"));
  const closeTour = (finished = false) => {
    clearHighlight();
    overlay.hidden = true;
    document.body.classList.remove("tour-open");
    if (finished) showToast(tourText.completeToast);
    if (previousFocus) previousFocus.focus();
  };
  const renderStep = () => {
    const step = steps[currentStep];
    const group = document.querySelector("[data-demo-tabs]");
    activateTab(group, step.tab);
    clearHighlight();
    const target = document.querySelector(`[data-tour-target="${step.target}"]`);
    if (target) { target.classList.add("tour-highlight"); target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); }
    progress.textContent = tourText.progress(currentStep + 1, steps.length);
    title.textContent = step.title;
    copy.textContent = step.copy;
    back.disabled = currentStep === 0;
    back.hidden = false;
    skip.hidden = false;
    tourFeedback.hidden = true;
    next.textContent = currentStep === steps.length - 1 ? tourText.finish : tourText.next;
    next.focus();
  };
  const renderComplete = () => {
    clearHighlight();
    tourComplete = true;
    progress.textContent = tourText.completeProgress;
    title.textContent = tourText.completeTitle;
    copy.textContent = tourText.completeCopy;
    back.hidden = true;
    skip.hidden = true;
    tourFeedback.hidden = false;
    next.textContent = tourText.close;
    next.focus();
  };
  const openTour = () => { previousFocus = document.activeElement; currentStep = 0; tourComplete = false; overlay.hidden = false; document.body.classList.add("tour-open"); renderStep(); };
  tourStart.addEventListener("click", openTour);
  back.addEventListener("click", () => { if (currentStep > 0) { currentStep -= 1; renderStep(); } });
  next.addEventListener("click", () => { if (tourComplete) closeTour(true); else if (currentStep === steps.length - 1) renderComplete(); else { currentStep += 1; renderStep(); } });
  skip.addEventListener("click", () => closeTour());
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeTour(); return; }
    if (event.key !== "Tab") return;
    const controls = Array.from(dialog.querySelectorAll("a[href], button:not([disabled])")).filter((control) => !control.hidden);
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (new URLSearchParams(window.location.search).get("tour") === "1") setTimeout(openTour, 350);
}
