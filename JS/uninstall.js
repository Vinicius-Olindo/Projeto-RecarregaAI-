// RecarregaAi! V.1.2.5

const feedbackSubmitUrl = "https://formsubmit.co/ajax/vinim0106@icloud.com";
const defaultVersionLabel = "V.1.2.5";

const uninstallElements = {
  copyFeedbackButton: document.querySelector("#copy-feedback-button"),
  extensionVersion: document.querySelector("#extension-version"),
  feedbackBrowserInput: document.querySelector("#feedback-browser-input"),
  feedbackDateInput: document.querySelector("#feedback-date-input"),
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackStatus: document.querySelector("#feedback-status"),
  feedbackVersionInput: document.querySelector("#feedback-version-input"),
  contactEmail: document.querySelector("#contact-email"),
  experienceRating: document.querySelector("#experience-rating")
};

const getPageParams = () => new URLSearchParams(window.location.search);

const getVersionLabel = () => {
  const params = getPageParams();

  return params.get("version") || defaultVersionLabel;
};

const getSelectedReason = () => {
  const selectedReasonInput = document.querySelector("[name='Motivo']:checked");

  return selectedReasonInput?.value || "Outro motivo";
};

const updateStatus = (message) => {
  uninstallElements.feedbackStatus.textContent = message;
};

const prepareHiddenFields = () => {
  uninstallElements.feedbackVersionInput.value = getVersionLabel();
  uninstallElements.feedbackDateInput.value = new Date().toISOString();
  uninstallElements.feedbackBrowserInput.value = navigator.userAgent;
};

const buildFeedbackBody = () => {
  const message = uninstallElements.feedbackMessage.value.trim()
    || "O usuario nao informou detalhes adicionais.";
  const email = uninstallElements.contactEmail.value.trim()
    || "Nao informado";
  const rating = uninstallElements.experienceRating.value;

  return [
    "Feedback de desinstalacao",
    "",
    `Versao: ${getVersionLabel()}`,
    `Motivo: ${getSelectedReason()}`,
    `Nota da experiencia: ${rating}/5`,
    `Email para contato: ${email}`,
    `Data: ${new Date().toISOString()}`,
    "",
    "Comentario:",
    message,
    "",
    `Navegador: ${navigator.userAgent}`
  ].join("\n");
};

const submitFeedbackWithFallback = async () => {
  prepareHiddenFields();

  const formData = new FormData(uninstallElements.feedbackForm);

  try {
    const response = await fetch(feedbackSubmitUrl, {
      body: formData,
      headers: {
        Accept: "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Envio automatico recusado.");
    }

    updateStatus("Feedback enviado. Obrigado por ajudar a melhorar.");
    uninstallElements.feedbackForm.reset();
    prepareHiddenFields();
  } catch (error) {
    console.error("Erro ao enviar feedback automaticamente:", error);
    updateStatus("Abrindo envio seguro do feedback...");
    uninstallElements.feedbackForm.submit();
  }
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
  updateStatus("Enviando feedback...");
  submitFeedbackWithFallback();
};

const initializePage = () => {
  uninstallElements.extensionVersion.textContent = getVersionLabel();
  prepareHiddenFields();
};

uninstallElements.feedbackForm.addEventListener("submit", submitFeedback);
uninstallElements.copyFeedbackButton.addEventListener("click", () => {
  copyFeedback();
});

initializePage();
