// RecarregaAi! V.1.2.1

const feedbackIssueUrl = "https://github.com/Vinicius-Olindo/RecarregaAI-/issues/new";
const defaultVersionLabel = "V.1.2.1";

const uninstallElements = {
  copyFeedbackButton: document.querySelector("#copy-feedback-button"),
  extensionVersion: document.querySelector("#extension-version"),
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackStatus: document.querySelector("#feedback-status"),
  contactEmail: document.querySelector("#contact-email"),
  experienceRating: document.querySelector("#experience-rating")
};

const reasonLabels = {
  cache: "Nao limpou o cache como eu esperava",
  missing: "Faltou alguma funcao importante",
  other: "Outro motivo",
  reload: "Recarregou a pagina na hora errada",
  usability: "Ficou confuso de usar"
};

const getPageParams = () => new URLSearchParams(window.location.search);

const getVersionLabel = () => {
  const params = getPageParams();

  return params.get("version") || defaultVersionLabel;
};

const getSelectedReason = () => {
  const selectedReasonInput = document.querySelector("[name='reason']:checked");
  const reasonValue = selectedReasonInput?.value || "other";

  return reasonLabels[reasonValue] || reasonLabels.other;
};

const updateStatus = (message) => {
  uninstallElements.feedbackStatus.textContent = message;
};

const buildFeedbackBody = () => {
  const message = uninstallElements.feedbackMessage.value.trim()
    || "O usuario nao informou detalhes adicionais.";
  const email = uninstallElements.contactEmail.value.trim()
    || "Nao informado";
  const rating = uninstallElements.experienceRating.value;

  return [
    "## Feedback de desinstalacao",
    "",
    `- Versao: ${getVersionLabel()}`,
    `- Motivo: ${getSelectedReason()}`,
    `- Nota da experiencia: ${rating}/5`,
    `- Email para contato: ${email}`,
    `- Data: ${new Date().toISOString()}`,
    "",
    "## Comentario",
    "",
    message,
    "",
    "## Dados tecnicos",
    "",
    `- Navegador: ${navigator.userAgent}`
  ].join("\n");
};

const buildFeedbackIssueUrl = () => {
  const params = new URLSearchParams({
    body: buildFeedbackBody(),
    labels: "feedback,uninstall",
    title: `Feedback de desinstalacao - ${getSelectedReason()}`
  });

  return `${feedbackIssueUrl}?${params.toString()}`;
};

const copyFeedback = async () => {
  try {
    await navigator.clipboard.writeText(buildFeedbackBody());
    updateStatus("Feedback copiado. Obrigado por ajudar a melhorar.");
  } catch (error) {
    console.error("Erro ao copiar feedback:", error);
    updateStatus("Nao foi possivel copiar agora. Selecione o texto manualmente.");
  }
};

const submitFeedback = (event) => {
  event.preventDefault();
  updateStatus("Abrindo feedback preenchido para revisao...");
  window.location.href = buildFeedbackIssueUrl();
};

const initializePage = () => {
  uninstallElements.extensionVersion.textContent = getVersionLabel();
};

uninstallElements.feedbackForm.addEventListener("submit", submitFeedback);
uninstallElements.copyFeedbackButton.addEventListener("click", () => {
  copyFeedback();
});

initializePage();
