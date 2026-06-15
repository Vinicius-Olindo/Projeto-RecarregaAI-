// RecarregaAi! V.1.3.2

const feedbackSubmitUrl = "https://formsubmit.co/ajax/vinim0106@icloud.com";
const defaultVersionLabel = "V.1.3.2";
const defaultLanguage = "pt-BR";
const defaultReason = "Nao informou motivo";
const languageStorageKey = "recarregaAiUninstallLanguage";

const translations = {
  "pt-BR": {
    backToTop: "Voltar ao topo",
    commentLabel: "Comentario",
    commentPlaceholder: "Conte em poucas palavras o que poderiamos melhorar.",
    copyButton: "Copiar resposta",
    copyError: "Nao foi possivel copiar agora. Selecione o texto manualmente.",
    copySuccess: "Feedback copiado. Obrigado por ajudar.",
    emailLabel: "Email para contato",
    feedbackLink: "Feedback",
    formSubmitError:
      "Nao consegui enviar. Confirme o FormSubmit no email ou use Copiar resposta.",
    formSubmitLoading: "Enviando feedback...",
    formSubmitSuccess: "Feedback enviado com sucesso. Obrigado por ajudar.",
    introFirst: [
      "Antes de desinstalar de vez, conte rapidamente o que nao funcionou bem.",
      "Sua opiniao ajuda a melhorar o RecarregaAi! para outros usuarios."
    ].join(" "),
    introSecond:
      "Selecione um motivo ou deixe uma mensagem opcional descrevendo sua experiencia.",
    languageLabel: "Idioma",
    noReason: "Nenhum motivo selecionado.",
    optionalCommentSummary: "Adicionar comentario opcional",
    pageTitle: "Lamentamos sua partida.",
    reasonRequired: "Selecione um motivo antes de enviar.",
    selectedPrefix: "Selecionado: ",
    sendButton: "Enviar feedback",
    versionLabel: "Versao 1.3.2"
  },
  en: {
    backToTop: "Back to top",
    commentLabel: "Comment",
    commentPlaceholder: "Tell us briefly what we could improve.",
    copyButton: "Copy response",
    copyError: "Could not copy right now. Select the text manually.",
    copySuccess: "Feedback copied. Thanks for helping.",
    emailLabel: "Contact email",
    feedbackLink: "Feedback",
    formSubmitError:
      "I could not send it. Confirm FormSubmit by email or use Copy response.",
    formSubmitLoading: "Sending feedback...",
    formSubmitSuccess: "Feedback sent successfully. Thanks for helping.",
    introFirst: [
      "Before uninstalling for good, quickly tell us what did not work well.",
      "Your opinion helps improve RecarregaAi! for other users."
    ].join(" "),
    introSecond:
      "Select a reason or leave an optional message describing your experience.",
    languageLabel: "Language",
    noReason: "No reason selected.",
    optionalCommentSummary: "Add optional comment",
    pageTitle: "Sorry to see you go.",
    reasonRequired: "Select a reason before sending.",
    selectedPrefix: "Selected: ",
    sendButton: "Send feedback",
    versionLabel: "Version 1.3.2"
  },
  es: {
    backToTop: "Volver arriba",
    commentLabel: "Comentario",
    commentPlaceholder: "Cuentanos brevemente que podriamos mejorar.",
    copyButton: "Copiar respuesta",
    copyError: "No se pudo copiar ahora. Selecciona el texto manualmente.",
    copySuccess: "Feedback copiado. Gracias por ayudar.",
    emailLabel: "Email de contacto",
    feedbackLink: "Feedback",
    formSubmitError:
      "No pude enviarlo. Confirma FormSubmit por email o usa Copiar respuesta.",
    formSubmitLoading: "Enviando feedback...",
    formSubmitSuccess: "Feedback enviado correctamente. Gracias por ayudar.",
    introFirst: [
      "Antes de desinstalar definitivamente, cuentanos rapidamente que no funciono bien.",
      "Tu opinion ayuda a mejorar RecarregaAi! para otros usuarios."
    ].join(" "),
    introSecond:
      "Selecciona un motivo o deja un mensaje opcional describiendo tu experiencia.",
    languageLabel: "Idioma",
    noReason: "Ningun motivo seleccionado.",
    optionalCommentSummary: "Agregar comentario opcional",
    pageTitle: "Lamentamos que te vayas.",
    reasonRequired: "Selecciona un motivo antes de enviar.",
    selectedPrefix: "Seleccionado: ",
    sendButton: "Enviar feedback",
    versionLabel: "Version 1.3.2"
  }
};

const reasonTranslations = {
  workflow: {
    "pt-BR": {
      label: "Fluxo de trabalho",
      reason: "Nao e mais necessario para meu fluxo de trabalho",
      text: "Nao e mais necessario para meu fluxo de trabalho"
    },
    en: {
      label: "Workflow",
      reason: "It is no longer needed for my workflow",
      text: "It is no longer needed for my workflow"
    },
    es: {
      label: "Flujo de trabajo",
      reason: "Ya no es necesario para mi flujo de trabajo",
      text: "Ya no es necesario para mi flujo de trabajo"
    }
  },
  cache: {
    "pt-BR": {
      label: "Cache",
      reason: "Nao limpou o cache como eu esperava",
      text: "Nao limpou o cache como eu esperava"
    },
    en: {
      label: "Cache",
      reason: "It did not clear cache as expected",
      text: "It did not clear cache as expected"
    },
    es: {
      label: "Cache",
      reason: "No limpio la cache como esperaba",
      text: "No limpio la cache como esperaba"
    }
  },
  reload: {
    "pt-BR": {
      label: "Reload",
      reason: "Recarregou a pagina na hora errada",
      text: "Recarregou a pagina na hora errada"
    },
    en: {
      label: "Reload",
      reason: "It reloaded the page at the wrong time",
      text: "It reloaded the page at the wrong time"
    },
    es: {
      label: "Recarga",
      reason: "Recargo la pagina en el momento equivocado",
      text: "Recargo la pagina en el momento equivocado"
    }
  },
  usability: {
    "pt-BR": {
      label: "Usabilidade",
      reason: "Ficou confuso de usar",
      text: "Ficou confuso de usar"
    },
    en: {
      label: "Usability",
      reason: "It was confusing to use",
      text: "It was confusing to use"
    },
    es: {
      label: "Usabilidad",
      reason: "Fue confuso de usar",
      text: "Fue confuso de usar"
    }
  },
  feature: {
    "pt-BR": {
      label: "Funcao ausente",
      reason: "Faltou alguma funcao importante",
      text: "Faltou alguma funcao importante"
    },
    en: {
      label: "Missing feature",
      reason: "An important feature was missing",
      text: "An important feature was missing"
    },
    es: {
      label: "Funcion faltante",
      reason: "Falto alguna funcion importante",
      text: "Falto alguna funcion importante"
    }
  },
  other: {
    "pt-BR": {
      label: "Outro",
      reason: "Outro motivo",
      text: "Outro motivo"
    },
    en: {
      label: "Other",
      reason: "Other reason",
      text: "Other reason"
    },
    es: {
      label: "Otro",
      reason: "Otro motivo",
      text: "Otro motivo"
    }
  }
};

const uninstallElements = {
  backToTopButton: document.querySelector("#back-to-top-button"),
  contactEmail: document.querySelector("#contact-email"),
  copyFeedbackButton: document.querySelector("#copy-feedback-button"),
  extensionVersion: document.querySelector("#extension-version"),
  feedbackBrowserInput: document.querySelector("#feedback-browser-input"),
  feedbackDateInput: document.querySelector("#feedback-date-input"),
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackLanguageInput: document.querySelector("#feedback-language-input"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackReasonInput: document.querySelector("#feedback-reason-input"),
  feedbackStatus: document.querySelector("#feedback-status"),
  feedbackVersionInput: document.querySelector("#feedback-version-input"),
  languageSelect: document.querySelector("#language-select"),
  pageRoot: document.querySelector("#page-root"),
  reasonInputs: document.querySelectorAll("[data-reason-id]"),
  reasonTextElements: document.querySelectorAll("[data-reason-text]"),
  sendFeedbackButton: document.querySelector("#send-feedback-button"),
  selectedReasonFeedback: document.querySelector("#selected-reason-feedback")
};

let isSendingFeedback = false;
let activeLanguage = defaultLanguage;

const getVersionLabel = () => defaultVersionLabel;

const getCopy = (key) => translations[activeLanguage][key];

const getReasonCopy = (reasonId) => (
  reasonTranslations[reasonId]?.[activeLanguage]
);

const getSelectedReasonInput = () => (
  document.querySelector("[data-reason-id]:checked")
);

const getSelectedReasonId = () => getSelectedReasonInput()?.dataset.reasonId;

const getSelectedReason = () => {
  const reasonCopy = getReasonCopy(getSelectedReasonId());

  return reasonCopy?.reason || defaultReason;
};

const hasSelectedReason = () => getSelectedReason() !== defaultReason;

const updateStatus = (message, { isError = false } = {}) => {
  uninstallElements.feedbackStatus.textContent = message;
  uninstallElements.feedbackStatus.classList.toggle("is-visible", Boolean(message));
  uninstallElements.feedbackStatus.classList.toggle("is-error", isError);
};

const updateSelectedReasonFeedback = () => {
  const reasonCopy = getReasonCopy(getSelectedReasonId());

  if (!reasonCopy) {
    uninstallElements.selectedReasonFeedback.textContent = getCopy("noReason");
    return;
  }

  const labelElement = document.createElement("strong");

  labelElement.textContent = reasonCopy.label;
  uninstallElements.selectedReasonFeedback.replaceChildren(
    getCopy("selectedPrefix"),
    labelElement
  );
};

const syncReasonSelection = () => {
  uninstallElements.feedbackReasonInput.value = getSelectedReason();
  uninstallElements.copyFeedbackButton.disabled = !hasSelectedReason();
  uninstallElements.sendFeedbackButton.disabled = !hasSelectedReason();
  updateSelectedReasonFeedback();
};

const setFeedbackControlsDisabled = (isDisabled) => {
  uninstallElements.reasonInputs.forEach((input) => {
    input.disabled = isDisabled;
  });
  uninstallElements.contactEmail.disabled = isDisabled;
  uninstallElements.feedbackMessage.disabled = isDisabled;
  uninstallElements.languageSelect.disabled = isDisabled;
  uninstallElements.copyFeedbackButton.disabled =
    isDisabled || !hasSelectedReason();
  uninstallElements.sendFeedbackButton.disabled =
    isDisabled || !hasSelectedReason();
};

const prepareHiddenFields = () => {
  uninstallElements.feedbackVersionInput.value = getVersionLabel();
  uninstallElements.feedbackDateInput.value = new Date().toISOString();
  uninstallElements.feedbackBrowserInput.value = navigator.userAgent;
  uninstallElements.feedbackLanguageInput.value = activeLanguage;
};

const buildFeedbackBody = () => {
  const message = uninstallElements.feedbackMessage.value.trim()
    || "O usuario nao informou detalhes adicionais.";
  const email = uninstallElements.contactEmail.value.trim()
    || "Nao informado";

  return [
    "Feedback de desinstalacao",
    "",
    `Versao: ${getVersionLabel()}`,
    `Idioma: ${activeLanguage}`,
    `Motivo: ${getSelectedReason()}`,
    `Email para contato: ${email}`,
    `Data: ${new Date().toISOString()}`,
    "",
    "Comentario:",
    message,
    "",
    `Navegador: ${navigator.userAgent}`
  ].join("\n");
};

const clearOptionalFields = () => {
  uninstallElements.feedbackMessage.value = "";
  uninstallElements.contactEmail.value = "";
};

const submitFeedback = async () => {
  if (isSendingFeedback || !hasSelectedReason()) {
    return;
  }

  isSendingFeedback = true;
  prepareHiddenFields();
  updateStatus(getCopy("formSubmitLoading"));

  const formData = new FormData(uninstallElements.feedbackForm);
  formData.delete("reason");
  setFeedbackControlsDisabled(true);

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

    updateStatus(getCopy("formSubmitSuccess"));
    clearOptionalFields();
    prepareHiddenFields();
  } catch (error) {
    console.error("Erro ao enviar feedback automaticamente:", error);
    updateStatus(getCopy("formSubmitError"), {
      isError: true
    });
  } finally {
    isSendingFeedback = false;
    setFeedbackControlsDisabled(false);
  }
};

const copyFeedback = async () => {
  try {
    await navigator.clipboard.writeText(buildFeedbackBody());
    updateStatus(getCopy("copySuccess"));
  } catch (error) {
    console.error("Erro ao copiar feedback:", error);
    updateStatus(getCopy("copyError"), {
      isError: true
    });
  }
};

const updateLocalizedText = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getCopy(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = getCopy(element.dataset.i18nPlaceholder);
  });

  uninstallElements.reasonTextElements.forEach((element) => {
    const reasonCopy = getReasonCopy(element.dataset.reasonText);

    if (reasonCopy) {
      element.textContent = reasonCopy.text;
    }
  });

  uninstallElements.extensionVersion.textContent = getCopy("versionLabel");
  uninstallElements.pageRoot.lang = activeLanguage;
  syncReasonSelection();
  prepareHiddenFields();
};

const setLanguage = (language) => {
  activeLanguage = translations[language] ? language : defaultLanguage;
  uninstallElements.languageSelect.value = activeLanguage;
  localStorage.setItem(languageStorageKey, activeLanguage);
  updateLocalizedText();
};

const handleFeedbackSubmit = (event) => {
  event.preventDefault();

  if (!hasSelectedReason()) {
    updateStatus(getCopy("reasonRequired"), {
      isError: true
    });
    return;
  }

  submitFeedback();
};

const handleBackToTopVisibility = () => {
  uninstallElements.backToTopButton.classList.toggle(
    "is-visible",
    window.scrollY > 260
  );
};

const initializePage = () => {
  const storedLanguage = localStorage.getItem(languageStorageKey);

  activeLanguage = translations[storedLanguage]
    ? storedLanguage
    : defaultLanguage;
  setLanguage(activeLanguage);
};

uninstallElements.reasonInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncReasonSelection();
    updateStatus("");
  });
});

uninstallElements.languageSelect.addEventListener("change", (event) => {
  setLanguage(event.target.value);
  updateStatus("");
});

uninstallElements.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
uninstallElements.copyFeedbackButton.addEventListener("click", () => {
  copyFeedback();
});
uninstallElements.backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    behavior: "smooth",
    top: 0
  });
});
window.addEventListener("scroll", handleBackToTopVisibility, {
  passive: true
});

initializePage();
