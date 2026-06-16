// RecarregaAi! V.1.4.8

import { appConfig } from "./modules/config.js";

const feedbackSubmitUrl = appConfig.feedbackSubmitUrl;
const feedbackFallbackUrl = appConfig.feedbackFallbackUrl;
const defaultVersionLabel = "V.1.4.8";
const defaultLanguage = "pt-BR";
const defaultReason = "Nao informou motivo";
const languageStorageKey = "recarregaAiUninstallLanguage";

const translations = {
  "pt-BR": {
    backToTop: "Voltar ao inicio",
    closeDialog: "Fechar",
    commentLabel: "Comentario",
    commentPlaceholder: "Conte em poucas palavras o que poderiamos melhorar.",
    emailLabel: "Email para contato",
    footerLegal: "RecarregaAi! Todos os direitos reservados.",
    footerPrivacy: "Privacidade",
    footerProject: "Projeto",
    footerSupport: "Suporte",
    footerText:
      "Seu feedback ajuda a deixar a extensao mais simples, estavel e util.",
    footerTitle: "Obrigado por testar o RecarregaAi!",
    formSubmitError:
      "Nao consegui confirmar o envio agora. Tente novamente em alguns instantes.",
    formSubmitFallbackSuccess:
      "Feedback registrado. Obrigado por ajudar a melhorar o RecarregaAi!",
    formSubmitLoading: "Enviando feedback...",
    formSubmitSuccess: "Feedback enviado com sucesso. Obrigado por ajudar.",
    introFirst: [
      "Antes de desinstalar de vez, conte rapidamente o que nao funcionou bem.",
      "Sua opiniao ajuda a melhorar o RecarregaAi! para outros usuarios."
    ].join(" "),
    introSecond:
      "Selecione um motivo ou deixe uma mensagem opcional descrevendo sua experiencia.",
    languageDialogText:
      "Altere o idioma da pagina para o seu idioma preferido.",
    languageDialogTitle: "Idioma",
    languageLabel: "Idioma",
    installButton: "Adicionar ao Chrome",
    noReason: "Nenhum motivo selecionado.",
    optionalCommentSummary: "Adicionar comentario opcional",
    pageTitle: "Lamentamos sua partida.",
    reasonRequired: "Selecione um motivo antes de enviar.",
    selectedPrefix: "Selecionado: ",
    sendButton: "Enviar feedback",
    versionLabel: "Versao 1.4.8"
  },
  en: {
    backToTop: "Back to start",
    closeDialog: "Close",
    commentLabel: "Comment",
    commentPlaceholder: "Tell us briefly what we could improve.",
    emailLabel: "Contact email",
    footerLegal: "RecarregaAi! All rights reserved.",
    footerPrivacy: "Privacy",
    footerProject: "Project",
    footerSupport: "Support",
    footerText:
      "Your feedback helps make the extension simpler, stable, and useful.",
    footerTitle: "Thank you for trying RecarregaAi!",
    formSubmitError:
      "I could not confirm the send right now. Try again in a few moments.",
    formSubmitFallbackSuccess:
      "Feedback registered. Thanks for helping improve RecarregaAi!",
    formSubmitLoading: "Sending feedback...",
    formSubmitSuccess: "Feedback sent successfully. Thanks for helping.",
    introFirst: [
      "Before uninstalling for good, quickly tell us what did not work well.",
      "Your opinion helps improve RecarregaAi! for other users."
    ].join(" "),
    introSecond:
      "Select a reason or leave an optional message describing your experience.",
    languageDialogText: "Change this page to your preferred language.",
    languageDialogTitle: "Language",
    languageLabel: "Language",
    installButton: "Add to Chrome",
    noReason: "No reason selected.",
    optionalCommentSummary: "Add optional comment",
    pageTitle: "Sorry to see you go.",
    reasonRequired: "Select a reason before sending.",
    selectedPrefix: "Selected: ",
    sendButton: "Send feedback",
    versionLabel: "Version 1.4.8"
  },
  es: {
    backToTop: "Volver al inicio",
    closeDialog: "Cerrar",
    commentLabel: "Comentario",
    commentPlaceholder: "Cuentanos brevemente que podriamos mejorar.",
    emailLabel: "Email de contacto",
    footerLegal: "RecarregaAi! Todos los derechos reservados.",
    footerPrivacy: "Privacidad",
    footerProject: "Proyecto",
    footerSupport: "Soporte",
    footerText:
      "Tu feedback ayuda a que la extension sea mas simple, estable y util.",
    footerTitle: "Gracias por probar RecarregaAi!",
    formSubmitError:
      "No pude confirmar el envio ahora. Intentalo de nuevo en unos momentos.",
    formSubmitFallbackSuccess:
      "Feedback registrado. Gracias por ayudar a mejorar RecarregaAi!",
    formSubmitLoading: "Enviando feedback...",
    formSubmitSuccess: "Feedback enviado correctamente. Gracias por ayudar.",
    introFirst: [
      "Antes de desinstalar definitivamente, cuentanos rapidamente que no funciono bien.",
      "Tu opinion ayuda a mejorar RecarregaAi! para otros usuarios."
    ].join(" "),
    introSecond:
      "Selecciona un motivo o deja un mensaje opcional describiendo tu experiencia.",
    languageDialogText: "Cambia esta pagina a tu idioma preferido.",
    languageDialogTitle: "Idioma",
    languageLabel: "Idioma",
    installButton: "Agregar a Chrome",
    noReason: "Ningun motivo seleccionado.",
    optionalCommentSummary: "Agregar comentario opcional",
    pageTitle: "Lamentamos que te vayas.",
    reasonRequired: "Selecciona un motivo antes de enviar.",
    selectedPrefix: "Seleccionado: ",
    sendButton: "Enviar feedback",
    versionLabel: "Version 1.4.8"
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
  closeLanguageButton: document.querySelector("#close-language-button"),
  contactEmail: document.querySelector("#contact-email"),
  extensionVersion: document.querySelector("#extension-version"),
  feedbackBrowserInput: document.querySelector("#feedback-browser-input"),
  feedbackDateInput: document.querySelector("#feedback-date-input"),
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackLanguageInput: document.querySelector("#feedback-language-input"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackReasonInput: document.querySelector("#feedback-reason-input"),
  feedbackStatus: document.querySelector("#feedback-status"),
  feedbackVersionInput: document.querySelector("#feedback-version-input"),
  languageDialog: document.querySelector("#language-dialog"),
  languageOptionButtons: document.querySelectorAll("[data-language-option]"),
  openLanguageButton: document.querySelector("#open-language-button"),
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
  uninstallElements.sendFeedbackButton.disabled = !hasSelectedReason();
  updateSelectedReasonFeedback();
};

const setFeedbackControlsDisabled = (isDisabled) => {
  uninstallElements.reasonInputs.forEach((input) => {
    input.disabled = isDisabled;
  });
  uninstallElements.contactEmail.disabled = isDisabled;
  uninstallElements.feedbackMessage.disabled = isDisabled;
  uninstallElements.openLanguageButton.disabled = isDisabled;
  uninstallElements.languageOptionButtons.forEach((button) => {
    button.disabled = isDisabled;
  });
  uninstallElements.sendFeedbackButton.disabled =
    isDisabled || !hasSelectedReason();
};

const prepareHiddenFields = () => {
  uninstallElements.feedbackVersionInput.value = getVersionLabel();
  uninstallElements.feedbackDateInput.value = new Date().toISOString();
  uninstallElements.feedbackBrowserInput.value = navigator.userAgent;
  uninstallElements.feedbackLanguageInput.value = activeLanguage;
};

const buildFeedbackPayload = () => {
  const message = uninstallElements.feedbackMessage.value.trim()
    || "O usuario nao informou detalhes adicionais.";
  const contactEmail = uninstallElements.contactEmail.value.trim();
  const emailLabel = contactEmail || "Nao informado";
  const payload = {
    _captcha: "false",
    _subject: "Feedback RecarregaAi!",
    _template: "table",
    Comentario: message,
    Data: new Date().toISOString(),
    "Email para contato": emailLabel,
    Idioma: activeLanguage,
    Motivo: getSelectedReason(),
    Navegador: navigator.userAgent,
    Versao: getVersionLabel()
  };

  if (contactEmail) {
    payload.email = contactEmail;
  }

  return payload;
};

const clearOptionalFields = () => {
  uninstallElements.feedbackMessage.value = "";
  uninstallElements.contactEmail.value = "";
};

const createEncodedPayload = (payload) => {
  const encodedPayload = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    encodedPayload.append(key, value);
  });

  return encodedPayload;
};

const submitFeedbackWithHiddenForm = (payload) => new Promise((resolve) => {
  const frameName = `recarregaai-feedback-${Date.now()}`;
  const iframe = document.createElement("iframe");
  const form = document.createElement("form");

  iframe.name = frameName;
  iframe.hidden = true;

  form.action = feedbackFallbackUrl;
  form.hidden = true;
  form.method = "POST";
  form.target = frameName;

  Object.entries(payload).forEach(([key, value]) => {
    const input = document.createElement("input");

    input.name = key;
    input.type = "hidden";
    input.value = value;
    form.append(input);
  });

  document.body.append(iframe, form);

  window.setTimeout(() => {
    form.remove();
    iframe.remove();
    resolve();
  }, 1400);

  form.submit();
});

const submitFeedback = async () => {
  if (isSendingFeedback || !hasSelectedReason()) {
    return;
  }

  isSendingFeedback = true;
  prepareHiddenFields();
  updateStatus(getCopy("formSubmitLoading"));

  const feedbackPayload = buildFeedbackPayload();
  setFeedbackControlsDisabled(true);

  try {
    const response = await fetch(feedbackSubmitUrl, {
      body: createEncodedPayload(feedbackPayload),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
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
    await submitFeedbackWithHiddenForm(feedbackPayload);
    updateStatus(getCopy("formSubmitFallbackSuccess"));
    clearOptionalFields();
    prepareHiddenFields();
  } finally {
    isSendingFeedback = false;
    setFeedbackControlsDisabled(false);
  }
};

const updateLanguageOptions = () => {
  uninstallElements.languageOptionButtons.forEach((button) => {
    const isSelected = button.dataset.languageOption === activeLanguage;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
};

const openLanguageDialog = () => {
  uninstallElements.languageDialog.hidden = false;
  document.body.classList.add("has-open-dialog");

  const selectedButton = document.querySelector(
    `[data-language-option="${activeLanguage}"]`
  );

  (selectedButton || uninstallElements.closeLanguageButton).focus();
};

const closeLanguageDialog = ({ shouldFocusTrigger = false } = {}) => {
  uninstallElements.languageDialog.hidden = true;
  document.body.classList.remove("has-open-dialog");

  if (shouldFocusTrigger) {
    uninstallElements.openLanguageButton.focus();
  }
};

const updateLocalizedText = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getCopy(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      getCopy(element.dataset.i18nAriaLabel)
    );
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
  updateLanguageOptions();
  syncReasonSelection();
  prepareHiddenFields();
};

const setLanguage = (language) => {
  activeLanguage = translations[language] ? language : defaultLanguage;
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

uninstallElements.openLanguageButton.addEventListener("click", () => {
  openLanguageDialog();
});

uninstallElements.closeLanguageButton.addEventListener("click", () => {
  closeLanguageDialog({
    shouldFocusTrigger: true
  });
});

uninstallElements.languageDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-language]")) {
    closeLanguageDialog({
      shouldFocusTrigger: true
    });
  }
});

uninstallElements.languageOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageOption);
    updateStatus("");
    closeLanguageDialog({
      shouldFocusTrigger: true
    });
  });
});

uninstallElements.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
uninstallElements.backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    behavior: "smooth",
    top: 0
  });
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !uninstallElements.languageDialog.hidden) {
    closeLanguageDialog({
      shouldFocusTrigger: true
    });
  }
});

initializePage();
