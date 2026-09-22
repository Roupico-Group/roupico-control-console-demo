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
    version: "trades-v2",
    stages: [
      {
        label: "Step 1 of 5 · Review",
        control: "Human decision",
        title: "Review the new fence-repair enquiry.",
        copy: "Jordan supplied a postcode, two photos and a preferred week. Check the evidence and scope before pricing the work.",
        facts: [["Customer", "Jordan M."], ["Request", "Replace two damaged fence panels"], ["Area", "Sheerness · ME12"], ["Access", "Side gate · driveway parking"]],
        artifact: { type: "evidence", title: "Enquiry evidence", items: ["2 customer photos", "Panels approximately 6 × 6 ft", "Existing posts appear reusable", "Removal requested"] },
        next: "Build an itemised sample quote and the message that would accompany it.",
        action: "Prepare sample quote",
        metrics: { enquiries: [5, "One ready to review"], jobs: [8, "Three on site today"], approvals: [3, "Nothing sends automatically"] },
        workload: { urgent: 3, today: 5, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"]],
      },
      {
        label: "Step 2 of 5 · Quote",
        control: "Approval required",
        title: "Review the itemised quote and customer message.",
        copy: "The console has brought the scope, individual prices and proposed wording together. Nothing has been sent.",
        facts: [["Customer", "Jordan M."], ["Scope", "Remove and replace two panels"], ["Quote status", "Draft only"], ["Validity", "14 days"]],
        artifact: { type: "quote", title: "Sample quote HTW-1048", lines: [["Fence panels", "2 × £140", "£280"], ["Posts and fixings", "1 set", "£45"], ["Labour", "3 hours", "£120"], ["Removal and disposal", "Fixed", "£35"]], total: "£480", message: "Hi Jordan, thanks for sending the photos. Based on the information provided, the sample quote to remove and replace the two damaged fence panels is £480, including materials and disposal. This is subject to confirming that the existing posts are sound when we arrive. The quote is valid for 14 days. Please let us know if you would like to go ahead or if you have any questions." },
        next: "Approval simulates sending this exact quote and then pauses for the customer’s decision.",
        action: "Approve and simulate sending quote",
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [8, "Three on site today"], approvals: [4, "Sample quote added"] },
        workload: { urgent: 3, today: 5, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Waiting for human approval"]],
      },
      {
        label: "Step 3 of 5 · Customer decision",
        control: "Waiting state",
        title: "Wait for Jordan—or record a call.",
        copy: "The quote is approved and simulated as sent. The workflow stops here until the customer replies or somebody contacts them.",
        facts: [["Quote", "HTW-1048 · £480"], ["Status", "Awaiting customer"], ["Sent", "Simulated · 08:49"], ["Next chase", "Tomorrow · 10:00"]],
        artifact: { type: "waiting", title: "Customer response", message: "No response recorded yet. The job cannot be booked until the customer accepts the quote.", callMessage: "Call route selected. Record the customer’s decision from the conversation before opening the diary." },
        secondaryAction: "Log a customer call instead",
        next: "Record an acceptance from an incoming reply or from your own call before choosing a slot.",
        action: "Simulate customer accepts",
        callAction: "Record accepted by phone",
        metrics: { enquiries: [4, "Quote awaiting a decision"], jobs: [8, "No visit booked yet"], approvals: [3, "Quote decision recorded"] },
        workload: { urgent: 2, today: 6, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Itemised price and message ready"], ["08:49", "Quote approved", "Simulated send · awaiting customer"]],
      },
      {
        label: "Step 4 of 5 · Schedule",
        control: "Choose a slot",
        title: "Select an available visit slot.",
        copy: "Jordan has accepted the sample quote. Compare the available diary options and choose the slot that fits the working day.",
        facts: [["Customer decision", "Accepted in this demo"], ["Quote", "HTW-1048 · £480"], ["Estimated work", "3 hours"], ["Team", "Harbour crew"]],
        artifact: { type: "slots", title: "Available appointments", slots: [["Thursday · 10:30", "Best fit · crew nearby"], ["Friday · 13:00", "Available after morning job"], ["Monday · 09:00", "First call of the day"]] },
        next: "Booking the selected slot prepares a customer confirmation using the exact date and time chosen.",
        action: "Book selected slot",
        metrics: { enquiries: [4, "Customer accepted"], jobs: [8, "Visit ready to schedule"], approvals: [3, "Customer decision recorded"] },
        workload: { urgent: 2, today: 6, track: 8 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Itemised price and message ready"], ["08:49", "Quote approved", "Simulated send recorded"], ["09:26", "Customer accepted quote", "{{decision}}"]],
      },
      {
        label: "Step 5 of 5 · Update",
        control: "Customer-facing review",
        title: "Review the booking confirmation.",
        copy: "The selected visit is now on the fictional schedule. Check the actual customer update before approving it.",
        facts: [["Recipient", "Jordan M."], ["Visit", "{{slot}}"], ["Channel", "WhatsApp draft"], ["Send rule", "Approval required"]],
        artifact: { type: "message", title: "Customer update draft", message: "Hi Jordan, thanks for confirming that you would like to go ahead with quote HTW-1048. We have booked the fence repair for {{slot}}. We will bring the materials and remove the damaged panels as quoted. Please let us know if access arrangements change before the visit." },
        next: "Approval records the confirmation. No real message is sent.",
        action: "Approve simulated customer update",
        metrics: { enquiries: [4, "Customer accepted"], jobs: [9, "Selected visit now included"], approvals: [4, "Confirmation waiting"] },
        workload: { urgent: 2, today: 5, track: 9 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Itemised price and message ready"], ["08:49", "Quote approved", "Simulated send recorded"], ["09:26", "Customer accepted quote", "{{decision}}"], ["09:29", "Visit booked", "{{slot}}"]],
      },
      {
        label: "Five-step example complete",
        control: "All decisions recorded",
        title: "The enquiry is ready for the next working day.",
        copy: "The itemised quote, customer acceptance, selected slot and final update now share one visible decision trail. Nothing left this browser.",
        facts: [["Enquiry", "Reviewed"], ["Quote", "£480 · approved"], ["Visit", "{{slot}}"], ["Update", "Approved · not sent"]],
        next: "Explore the wider example or discuss the workflow you actually use.",
        action: null,
        metrics: { enquiries: [4, "Reviewed and organised"], jobs: [9, "Sample visit now included"], approvals: [3, "Update decision recorded"] },
        workload: { urgent: 1, today: 6, track: 9 },
        activities: [["08:42", "New enquiry received", "Website request · fictional record"], ["08:47", "Sample quote prepared", "Itemised price and message ready"], ["08:49", "Quote approved", "Simulated send recorded"], ["09:26", "Customer accepted quote", "{{decision}}"], ["09:29", "Visit booked", "{{slot}}"], ["09:31", "Customer update approved", "Simulated action · nothing sent"]],
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

// Richer sector journeys: visible drafts, a real waiting point and a chosen next action.
Object.assign(journeyConfigs, {
  salon: {
    version: "salon-v2",
    defaultSlot: "Thursday · 18:00",
    stages: [
      { label: "Step 1 of 5 · Review", control: "Human decision", title: "Review the new colour enquiry.", copy: "Mia shared her preferred result, availability and colour history. Check the details before drafting a reply.", facts: [["Client", "Mia R."], ["Request", "Balayage consultation"], ["Preference", "Low-maintenance brunette"], ["History", "Previous box colour noted"]], artifact: { type: "evidence", title: "Client context", items: ["2 inspiration photos", "Evening availability", "Patch test required", "Prefers WhatsApp"] }, next: "Prepare the exact consultation reply for review.", action: "Prepare consultation reply", metrics: { enquiries: [7, "One ready to review"], bookings: [12, "Two useful gaps remain"], approvals: [3, "Nothing sends automatically"] }, workload: { urgent: 3, today: 6, track: 9 }, activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"]] },
      { label: "Step 2 of 5 · Approve", control: "Approval required", title: "Review the consultation reply.", copy: "Check the proposed wording, service boundary and patch-test reminder before anything moves forward.", facts: [["Client", "Mia R."], ["Service", "Colour consultation"], ["Channel", "WhatsApp draft"], ["Status", "Not sent"]], artifact: { type: "message", title: "Consultation reply draft", message: "Hi Mia, thanks for sharing the photos and your colour history. A consultation is the best next step so we can discuss the low-maintenance brunette result and check what is realistic for your hair. A patch test is also required before any colour appointment. If you would like to continue, reply here and we can offer the available evening consultation times." }, next: "Approval simulates sending this reply, then the workflow waits for Mia.", action: "Approve and simulate sending reply", metrics: { enquiries: [6, "Reviewed and organised"], bookings: [12, "Two useful gaps remain"], approvals: [4, "Consultation reply added"] }, workload: { urgent: 3, today: 6, track: 9 }, activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Waiting for salon approval"]] },
      { label: "Step 3 of 5 · Client decision", control: "Waiting state", title: "Wait for Mia—or record a call.", copy: "The reply is simulated as sent. No appointment should be created until Mia confirms she wants the consultation.", facts: [["Status", "Awaiting client"], ["Draft", "Approved in this demo"], ["Channel", "WhatsApp"], ["Chase", "Tomorrow afternoon"]], artifact: { type: "waiting", title: "Client response", message: "No response recorded yet. The diary remains unchanged.", callMessage: "Call route selected. Record Mia’s decision before opening the available consultation times." }, secondaryAction: "Log a client call instead", next: "Record an acceptance from Mia’s reply or from your call.", action: "Simulate Mia accepts", callAction: "Record accepted by phone", metrics: { enquiries: [6, "Reply awaiting a decision"], bookings: [12, "No consultation booked yet"], approvals: [3, "Reply decision recorded"] }, workload: { urgent: 2, today: 7, track: 9 }, activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Consultation reply prepared", "Client context included"], ["09:12", "Reply approved", "Simulated send · awaiting Mia"]] },
      { label: "Step 4 of 5 · Schedule", control: "Choose a slot", title: "Select an available consultation.", copy: "Mia has accepted. Choose the time that fits both her preference and the salon diary.", facts: [["Client decision", "Accepted in this demo"], ["Service", "Colour consultation"], ["Duration", "30 minutes"], ["Stylist", "Senior colourist"]], artifact: { type: "slots", title: "Available consultations", slots: [["Thursday · 18:00", "Matches evening preference"], ["Friday · 17:30", "Last consultation slot"], ["Saturday · 09:30", "Before first colour booking"]] }, next: "The selected time will be inserted into the client confirmation.", action: "Book selected consultation", metrics: { enquiries: [6, "Client accepted"], bookings: [12, "Consultation ready to book"], approvals: [3, "Client decision recorded"] }, workload: { urgent: 2, today: 7, track: 9 }, activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Reply prepared", "Patch-test reminder included"], ["09:12", "Reply approved", "Simulated send recorded"], ["09:28", "Mia accepted consultation", "{{decision}}"]] },
      { label: "Step 5 of 5 · Update", control: "Client-facing review", title: "Review the consultation confirmation.", copy: "Check the chosen time, patch-test instruction and actual message before approval.", facts: [["Client", "Mia R."], ["Consultation", "{{slot}}"], ["Channel", "WhatsApp draft"], ["Send rule", "Approval required"]], artifact: { type: "message", title: "Client confirmation draft", message: "Hi Mia, your colour consultation is booked for {{slot}} with our senior colourist. We will discuss your hair history, the result you would like and the maintenance involved. We will also complete the required patch test. Please let us know if you need to change the appointment.", }, next: "Approval records the confirmation. No real message is sent.", action: "Approve simulated confirmation", metrics: { enquiries: [6, "Client accepted"], bookings: [13, "Selected consultation included"], approvals: [4, "Confirmation waiting"] }, workload: { urgent: 2, today: 6, track: 10 }, activities: [["09:06", "Colour enquiry received", "Instagram message · fictional record"], ["09:10", "Reply prepared", "Patch-test reminder included"], ["09:12", "Reply approved", "Simulated send recorded"], ["09:28", "Mia accepted consultation", "{{decision}}"], ["09:31", "Consultation booked", "{{slot}}"]] },
      { label: "Five-step example complete", control: "All decisions recorded", title: "The consultation is ready for the salon diary.", copy: "The enquiry, real draft, client decision, chosen slot and confirmation share one visible trail.", facts: [["Enquiry", "Reviewed"], ["Reply", "Approved"], ["Consultation", "{{slot}}"], ["Confirmation", "Approved · not sent"]], next: "Explore the wider example or discuss your salon workflow.", action: null, metrics: { enquiries: [6, "Reviewed"], bookings: [13, "Consultation included"], approvals: [3, "Decision recorded"] }, workload: { urgent: 1, today: 7, track: 10 }, activities: [["09:06", "Colour enquiry received", "Fictional record"], ["09:10", "Reply prepared", "Context included"], ["09:12", "Reply approved", "Simulated send"], ["09:28", "Client accepted", "{{decision}}"], ["09:31", "Consultation booked", "{{slot}}"], ["09:33", "Confirmation approved", "Nothing sent"]] },
    ],
  },
  safety: {
    version: "safety-v2",
    defaultSlot: "Tuesday · 10:30",
    stages: [
      { label: "Step 1 of 5 · Review", control: "Admin decision", title: "Review the inspection enquiry.", copy: "Check the site, contact and stated request without making a technical assessment.", facts: [["Client", "North Quay Storage"], ["Request", "Warehouse inspection"], ["Site", "Single-storey unit"], ["Boundary", "Admin triage only"]], artifact: { type: "evidence", title: "Information received", items: ["Site address", "Primary contact", "Preferred week", "General warehouse use"] }, next: "Prepare the missing scope and access questions.", action: "Prepare scope questions", metrics: { enquiries: [6, "Two need clarification"], visits: [4, "Access notes checked"], reviews: [5, "Qualified decision required"] }, workload: { urgent: 4, today: 6, track: 10 }, activities: [["08:18", "Inspection enquiry logged", "Email request · fictional record"]] },
      { label: "Step 2 of 5 · Clarify", control: "Approval required", title: "Review the scope request.", copy: "The prepared email asks for administrative facts only. It does not contain safety advice.", facts: [["Missing", "Work activity summary"], ["Access", "Induction requirements"], ["Timing", "Operating hours"], ["Boundary", "No technical advice"]], artifact: { type: "message", title: "Client information request", message: "Hello, thank you for your warehouse inspection enquiry. Before an advisor reviews the scope, please confirm the main work activities taking place, normal operating hours, any visitor induction requirements and your preferred inspection week. This request is for administrative scoping only; a competent person will determine the professional requirements." }, next: "Approval simulates sending these questions and pauses for the client’s details.", action: "Approve and simulate sending request", metrics: { enquiries: [5, "Clarification organised"], visits: [4, "No new visit booked"], reviews: [6, "Scope request added"] }, workload: { urgent: 4, today: 6, track: 10 }, activities: [["08:18", "Enquiry logged", "Fictional record"], ["08:24", "Scope request prepared", "Waiting for admin approval"]] },
      { label: "Step 3 of 5 · Client details", control: "Waiting state", title: "Wait for the details—or record a call.", copy: "The inspection cannot be scheduled until the missing activity and access information is recorded.", facts: [["Status", "Awaiting client"], ["Request", "Simulated as sent"], ["Missing", "Activity and induction details"], ["Chase", "Next working day"]], artifact: { type: "waiting", title: "Scope response", message: "No response recorded. The enquiry remains outside the advisor’s review queue.", callMessage: "Call route selected. Record the administrative details supplied by the client." }, secondaryAction: "Log a client call instead", next: "Record the client response before opening the inspection diary.", action: "Simulate details received", callAction: "Record details from call", metrics: { enquiries: [5, "Waiting for client details"], visits: [4, "No visit booked yet"], reviews: [5, "Professional review not started"] }, workload: { urgent: 3, today: 7, track: 10 }, activities: [["08:18", "Enquiry logged", "Fictional record"], ["08:24", "Questions prepared", "Admin-only request"], ["08:27", "Request approved", "Simulated send · awaiting client"]] },
      { label: "Step 4 of 5 · Schedule", control: "Choose a slot", title: "Select an inspection slot.", copy: "The client supplied the missing details. Choose a time with the assigned competent person.", facts: [["Scope", "Admin details complete"], ["Advisor", "Competent person assigned"], ["Access", "Induction at reception"], ["Duration", "2 hours"]], artifact: { type: "slots", title: "Advisor availability", slots: [["Tuesday · 10:30", "Advisor and site available"], ["Wednesday · 14:00", "Afternoon inspection"], ["Friday · 09:00", "First visit of the day"]] }, next: "The selected visit creates a review pack for the advisor.", action: "Book selected inspection", metrics: { enquiries: [5, "Details received"], visits: [4, "Inspection ready to book"], reviews: [5, "Professional decision pending"] }, workload: { urgent: 3, today: 7, track: 10 }, activities: [["08:18", "Enquiry logged", "Fictional record"], ["08:24", "Questions prepared", "Admin-only"], ["08:27", "Request approved", "Simulated send"], ["09:04", "Client details received", "{{decision}}"]] },
      { label: "Step 5 of 5 · Route", control: "Professional boundary", title: "Review the advisor pack and assign it.", copy: "Confirm that the pack contains context—not findings, advice or regulated documents.", facts: [["Visit", "{{slot}}"], ["Reviewer", "Assigned competent person"], ["Status", "Professional review required"], ["Boundary", "No automated judgement"]], artifact: { type: "evidence", title: "Administrative review pack", items: ["Client and site contacts", "Work activity summary", "Access and induction notes", "Selected visit time", "Original enquiry attached", "No technical conclusions"] }, next: "Routing records ownership. The competent person still makes every technical decision.", action: "Route for professional review", metrics: { enquiries: [5, "Details received"], visits: [5, "Selected inspection included"], reviews: [6, "Review pack waiting"] }, workload: { urgent: 3, today: 6, track: 11 }, activities: [["08:18", "Enquiry logged", "Fictional record"], ["08:24", "Questions prepared", "Admin-only"], ["08:27", "Request approved", "Simulated send"], ["09:04", "Client details received", "{{decision}}"], ["09:08", "Inspection booked", "{{slot}}"]] },
      { label: "Five-step example complete", control: "Professional review required", title: "The enquiry is ready for qualified review.", copy: "The real questions, client response, selected visit and administrative pack share one visible trail.", facts: [["Enquiry", "Admin-reviewed"], ["Details", "Received"], ["Visit", "{{slot}}"], ["Review", "Assigned · not completed"]], next: "Explore the wider example or discuss your administration workflow.", action: null, metrics: { enquiries: [5, "Clarified"], visits: [5, "Inspection included"], reviews: [6, "Qualified review required"] }, workload: { urgent: 2, today: 7, track: 11 }, activities: [["08:18", "Enquiry logged", "Fictional record"], ["08:24", "Questions prepared", "Admin-only"], ["08:27", "Request approved", "Simulated send"], ["09:04", "Details received", "{{decision}}"], ["09:08", "Inspection booked", "{{slot}}"], ["09:10", "Review pack assigned", "Competent person required"]] },
    ],
  },
  realestate: {
    version: "realestate-v2",
    defaultSlot: "Quinta-feira · 15:00",
    ui: { workload: ({ urgent, today, track }) => `Trabalho de exemplo: ${urgent} urgentes, ${today} para hoje e ${track} controlados`, completeAnnouncement: "Exemplo concluído. Todas as decisões simuladas ficaram registadas.", completeToast: "Exemplo concluído · nada foi enviado", stepToast: (step) => `Passo ${step} concluído · ação simulada`, explore: "Explorar o painel completo", hideExplore: "Ocultar o painel completo", decisionPhone: "Aceite por telefone", decisionReply: "Aceite por resposta simulada" },
    stages: [
      { label: "Passo 1 de 5 · Analisar", control: "Decisão humana", title: "Analise o novo pedido de visita.", copy: "Confirme o contacto, imóvel, questão e disponibilidade antes de preparar uma resposta.", facts: [["Contacto", "António Almeida"], ["Imóvel", "LC-204 · T3 Cascais"], ["Preferência", "Depois das 15h"], ["Origem", "Idealista · fictício"]], artifact: { type: "evidence", title: "Contexto do contacto", items: ["Pergunta sobre estacionamento", "Pretende visitar esta semana", "Telefone confirmado", "Ficha do imóvel disponível"] }, next: "Preparar a resposta completa para revisão do agente.", action: "Preparar resposta", metrics: { leads: [8, "Um pronto para analisar"], visits: [3, "Duas em Cascais"], approvals: [4, "Nada é enviado automaticamente"] }, workload: { urgent: 3, today: 6, track: 9 }, activities: [["09:12", "Pedido de visita recebido", "Idealista · registo fictício"]] },
      { label: "Passo 2 de 5 · Aprovar", control: "Aprovação necessária", title: "Reveja a resposta preparada.", copy: "Confirme o imóvel, a resposta à questão e o pedido de disponibilidade antes do envio simulado.", facts: [["Contacto", "António Almeida"], ["Imóvel", "LC-204"], ["Canal", "Email"], ["Estado", "Rascunho · não enviado"]], artifact: { type: "message", title: "Resposta ao pedido de visita", editorLabel: "Mensagem preparada — reveja ou edite antes de aprovar", message: "Exmo. Sr. Almeida, obrigado pelo seu interesse no T3 em Cascais (ref. LC-204). O imóvel inclui um lugar de estacionamento. Temos disponibilidade para visitas esta semana depois das 15h. Se pretender avançar, confirme por favor e apresentaremos os horários ainda disponíveis." }, next: "A aprovação simula o envio e coloca o contacto em espera.", action: "Aprovar e simular envio", metrics: { leads: [7, "Contacto analisado"], visits: [3, "Sem nova visita"], approvals: [5, "Resposta adicionada"] }, workload: { urgent: 3, today: 6, track: 9 }, activities: [["09:12", "Pedido recebido", "Registo fictício"], ["09:16", "Resposta preparada", "A aguardar aprovação"]] },
      { label: "Passo 3 de 5 · Decisão", control: "Estado de espera", title: "Aguarde pelo contacto — ou registe uma chamada.", copy: "A visita não deve ser marcada até o contacto confirmar que pretende avançar.", facts: [["Estado", "A aguardar contacto"], ["Resposta", "Envio simulado"], ["Imóvel", "LC-204"], ["Seguimento", "Amanhã de manhã"]], artifact: { type: "waiting", title: "Resposta do contacto", statusLabel: "A aguardar contacto", callLabel: "Chamada ao contacto", message: "Ainda não existe resposta. A agenda permanece inalterada.", callMessage: "Via de chamada selecionada. Registe a decisão antes de abrir os horários." }, secondaryAction: "Registar uma chamada", secondaryUndo: "Usar resposta simulada", next: "Registe a aceitação por resposta ou por chamada.", action: "Simular aceitação do contacto", callAction: "Registar aceitação por telefone", metrics: { leads: [7, "Resposta a aguardar decisão"], visits: [3, "Nenhuma visita marcada"], approvals: [4, "Resposta aprovada"] }, workload: { urgent: 2, today: 7, track: 9 }, activities: [["09:12", "Pedido recebido", "Registo fictício"], ["09:16", "Resposta preparada", "Imóvel e questão reunidos"], ["09:18", "Resposta aprovada", "Envio simulado · a aguardar"]] },
      { label: "Passo 4 de 5 · Marcar", control: "Escolher horário", title: "Escolha um horário disponível.", copy: "O contacto aceitou. Compare as opções da agenda e selecione a visita.", facts: [["Decisão", "Aceite nesta demonstração"], ["Imóvel", "LC-204"], ["Duração", "45 minutos"], ["Agente", "Inês Costa"]], artifact: { type: "slots", title: "Horários disponíveis", legend: "Selecione um horário", slots: [["Quinta-feira · 15:00", "Preferência do contacto"], ["Quinta-feira · 16:30", "Após visita em Oeiras"], ["Sexta-feira · 17:00", "Última visita do dia"]] }, next: "O horário escolhido será incluído na confirmação.", action: "Marcar horário selecionado", metrics: { leads: [7, "Contacto aceitou"], visits: [3, "Visita pronta para marcar"], approvals: [4, "Decisão registada"] }, workload: { urgent: 2, today: 7, track: 9 }, activities: [["09:12", "Pedido recebido", "Fictício"], ["09:16", "Resposta preparada", "Contexto reunido"], ["09:18", "Resposta aprovada", "Envio simulado"], ["09:34", "Contacto aceitou", "{{decision}}"]] },
      { label: "Passo 5 de 5 · Confirmar", control: "Revisão dirigida ao cliente", title: "Reveja a confirmação da visita.", copy: "Confirme destinatário, imóvel, horário e mensagem antes da aprovação final.", facts: [["Destinatário", "António Almeida"], ["Visita", "{{slot}}"], ["Imóvel", "LC-204"], ["Regra", "Aprovação necessária"]], artifact: { type: "message", title: "Confirmação da visita", editorLabel: "Mensagem preparada — reveja ou edite antes de aprovar", message: "Exmo. Sr. Almeida, confirmo a visita ao T3 em Cascais (ref. LC-204) para {{slot}}. A ficha do imóvel segue associada a esta confirmação. Encontramo-nos junto à entrada principal; caso surja algum imprevisto, agradeço que nos informe." }, next: "A aprovação regista a confirmação. Nenhuma mensagem real é enviada.", action: "Aprovar confirmação simulada", metrics: { leads: [7, "Contacto aceitou"], visits: [4, "Visita selecionada incluída"], approvals: [5, "Confirmação a aguardar"] }, workload: { urgent: 2, today: 6, track: 10 }, activities: [["09:12", "Pedido recebido", "Fictício"], ["09:16", "Resposta preparada", "Contexto reunido"], ["09:18", "Resposta aprovada", "Envio simulado"], ["09:34", "Contacto aceitou", "{{decision}}"], ["09:36", "Visita marcada", "{{slot}}"]] },
      { label: "Exemplo de cinco passos concluído", control: "Todas as decisões registadas", title: "O pedido de visita está organizado.", copy: "A resposta real, decisão do contacto, horário escolhido e confirmação partilham um histórico visível.", facts: [["Contacto", "Analisado"], ["Resposta", "Aprovada"], ["Visita", "{{slot}}"], ["Confirmação", "Aprovada · não enviada"]], next: "Explore o exemplo completo ou fale connosco sobre o seu processo.", action: null, metrics: { leads: [7, "Analisado"], visits: [4, "Visita incluída"], approvals: [4, "Decisão registada"] }, workload: { urgent: 1, today: 7, track: 10 }, activities: [["09:12", "Pedido recebido", "Fictício"], ["09:16", "Resposta preparada", "Contexto"], ["09:18", "Resposta aprovada", "Simulado"], ["09:34", "Contacto aceitou", "{{decision}}"], ["09:36", "Visita marcada", "{{slot}}"], ["09:38", "Confirmação aprovada", "Nada enviado"]] },
    ],
  },
});

const journeyRoot = document.querySelector("[data-flagship-journey]");
if (journeyRoot) {
  const config = journeyConfigs[journeyRoot.dataset.scenario];
  const journeyUi = {
    workload: ({ urgent, today, track }) => `Example workload: ${urgent} urgent, ${today} due today and ${track} on track`,
    completeAnnouncement: "Example complete. All simulated decisions are recorded.",
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
  const artifactRoot = journeyRoot.querySelector("[data-journey-artifact]");
  const choicesRoot = journeyRoot.querySelector("[data-journey-choices]");
  const actionButton = journeyRoot.querySelector("[data-journey-action]");
  const resetButton = journeyRoot.querySelector("[data-journey-reset]");
  const statusMessage = journeyRoot.querySelector("[data-journey-status]");
  const activityList = journeyRoot.querySelector("[data-activity-list]");
  const ring = journeyRoot.querySelector("[data-workload-ring]");
  const completePanel = journeyRoot.querySelector("[data-journey-complete]");
  const conversionPanel = document.querySelector("[data-conversion-panel]");
  const exploreButton = journeyRoot.querySelector("[data-explore-toggle]");
  const fullExample = journeyRoot.querySelector("[data-full-example]");
  const storedState = getState();
  const storedStep = Number(storedState.journeyVersion === config.version || !config.version ? storedState.journeyStep : 0);
  let journeyStep = Number.isInteger(storedStep) ? Math.max(0, Math.min(storedStep, config.stages.length - 1)) : 0;
  let callMode = Boolean(storedState.callMode);
  let selectedSlot = storedState.journeySlot || config.defaultSlot || "Thursday · 10:30";

  const resolveText = (value) => String(value)
    .replaceAll("{{slot}}", selectedSlot)
    .replaceAll("{{decision}}", callMode ? (config.ui?.decisionPhone || "Accepted by phone") : (config.ui?.decisionReply || "Accepted via simulated reply"));

  const renderPairs = (container, pairs, termTag, detailTag) => {
    container.textContent = "";
    pairs.forEach(([term, detail]) => {
      const wrapper = document.createElement("div");
      const termNode = document.createElement(termTag);
      const detailNode = document.createElement(detailTag);
      termNode.textContent = term;
      detailNode.textContent = resolveText(detail);
      wrapper.append(termNode, detailNode);
      container.append(wrapper);
    });
  };

  const renderArtifact = (artifact) => {
    if (!artifactRoot) return;
    artifactRoot.textContent = "";
    artifactRoot.hidden = !artifact;
    if (!artifact) return;
    const heading = document.createElement("h4");
    heading.textContent = artifact.title;
    artifactRoot.append(heading);

    if (artifact.type === "evidence") {
      const list = document.createElement("ul");
      artifact.items.forEach((value) => { const item = document.createElement("li"); item.textContent = value; list.append(item); });
      artifactRoot.append(list);
    }

    if (artifact.type === "quote") {
      const table = document.createElement("table");
      table.innerHTML = "<thead><tr><th>Item</th><th>Basis</th><th>Price</th></tr></thead>";
      const body = document.createElement("tbody");
      artifact.lines.forEach((line) => { const row = document.createElement("tr"); line.forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); }); body.append(row); });
      table.append(body);
      const total = document.createElement("p");
      total.className = "quote-total";
      total.innerHTML = `<span>Sample total</span><strong>${artifact.total}</strong>`;
      const message = document.createElement("div");
      message.className = "message-preview";
      message.innerHTML = "<strong>Customer message draft</strong>";
      const copy = document.createElement("p");
      copy.textContent = artifact.message;
      message.append(copy);
      artifactRoot.append(table, total, message);
    }

    if (artifact.type === "waiting") {
      const status = document.createElement("div");
      status.className = "waiting-state";
      status.innerHTML = `<span aria-hidden="true">◷</span><p><strong>${callMode ? (artifact.callLabel || "Customer call") : (artifact.statusLabel || "Awaiting customer")}</strong><small>${callMode ? artifact.callMessage : artifact.message}</small></p>`;
      artifactRoot.append(status);
    }

    if (artifact.type === "slots") {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "slot-options";
      fieldset.innerHTML = `<legend>${artifact.legend || "Select one available slot"}</legend>`;
      artifact.slots.forEach(([slot, note], index) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "journey-slot";
        input.value = slot;
        input.checked = selectedSlot === slot || (!artifact.slots.some(([value]) => value === selectedSlot) && index === 0);
        input.addEventListener("change", () => { selectedSlot = input.value; });
        const copy = document.createElement("span");
        copy.innerHTML = `<strong>${slot}</strong><small>${note}</small>`;
        label.append(input, copy);
        fieldset.append(label);
      });
      artifactRoot.append(fieldset);
    }

    if (artifact.type === "message") {
      const label = document.createElement("label");
      label.className = "message-editor";
      label.innerHTML = `<strong>${artifact.editorLabel || "Prepared message—review or edit before approval"}</strong>`;
      const textarea = document.createElement("textarea");
      textarea.rows = 6;
      textarea.value = resolveText(artifact.message);
      label.append(textarea);
      artifactRoot.append(label);
    }
  };

  const renderJourney = (announce = false) => {
    const state = config.stages[journeyStep];
    stepLabel.textContent = state.label;
    stepControl.textContent = state.control;
    stepTitle.textContent = state.title;
    stepCopy.textContent = state.copy;
    stepNext.textContent = state.next;
    renderPairs(stepFacts, state.facts, "dt", "dd");
    renderArtifact(state.artifact);

    if (choicesRoot) {
      choicesRoot.textContent = "";
      choicesRoot.hidden = !state.secondaryAction;
      if (state.secondaryAction) {
        const secondary = document.createElement("button");
        secondary.type = "button";
        secondary.textContent = callMode ? (state.secondaryUndo || "Use simulated incoming reply instead") : state.secondaryAction;
        secondary.addEventListener("click", () => {
          callMode = !callMode;
          const current = getState();
          current.callMode = callMode;
          current.journeyVersion = config.version;
          saveState(current);
          renderJourney(true);
          actionButton.focus();
        });
        choicesRoot.append(secondary);
      }
    }

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
      detailNode.textContent = resolveText(detail);
      copyNode.append(titleNode, detailNode);
      item.append(timeNode, copyNode);
      activityList.append(item);
    });

    const finished = journeyStep === config.stages.length - 1;
    actionButton.hidden = finished;
    actionButton.textContent = callMode && state.callAction ? state.callAction : (state.action || "");
    completePanel.hidden = !finished;
    conversionPanel.hidden = journeyStep === 0;
    if (announce) statusMessage.textContent = finished ? journeyUi.completeAnnouncement : `${state.label}. ${state.title}`;
  };

  actionButton.addEventListener("click", () => {
    if (journeyStep >= config.stages.length - 1) return;
    const currentState = config.stages[journeyStep];
    if (currentState.artifact?.type === "slots") {
      const picked = journeyRoot.querySelector('input[name="journey-slot"]:checked');
      if (!picked) { statusMessage.textContent = "Choose an available slot before continuing."; return; }
      selectedSlot = picked.value;
    }
    journeyStep += 1;
    const current = getState();
    current.journeyStep = journeyStep;
    current.journeyVersion = config.version;
    current.journeySlot = selectedSlot;
    current.callMode = callMode;
    saveState(current);
    renderJourney(true);
    showToast(journeyStep === config.stages.length - 1 ? journeyUi.completeToast : journeyUi.stepToast(journeyStep));
  });

  resetButton.addEventListener("click", () => {
    journeyStep = 0;
    callMode = false;
    selectedSlot = config.defaultSlot || "Thursday · 10:30";
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
      stepTitle.tabIndex = -1;
      stepTitle.focus({ preventScroll: true });
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
