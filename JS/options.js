// RecarregaAi! 1.7.4

import { initFloatingTools } from "./modules/floating-tools.js";
import {
  defaultLanguage,
  initLanguageDialog
} from "./modules/language-dialog.js";
import {
  defaultAppSettings,
  getPermissionPatternForOrigin,
  storageKeys
} from "./modules/shared.js";
import {
  loadThemePreference,
  toggleThemePreference
} from "./modules/theme.js";

const optionsPreviewStorageKey = "recarregaAiOptionsPreviewSettings";

const optionsElements = {
  addSiteButton: document.querySelector("#add-site-button"),
  defaultIntervalInput: document.querySelector("#default-interval-input"),
  extensionVersion: document.querySelector("#extension-version"),
  optionsStatus: document.querySelector("#options-status"),
  saveSettingsButton: document.querySelector("#save-settings-button"),
  siteIntervalInput: document.querySelector("#site-interval-input"),
  siteOriginInput: document.querySelector("#site-origin-input"),
  sitesEmptyState: document.querySelector("#sites-empty-state"),
  sitesList: document.querySelector("#sites-list"),
  summaryDefaultInterval: document.querySelector("#summary-default-interval"),
  summarySitesCount: document.querySelector("#summary-sites-count"),
  themeToggleButton: document.querySelector("#theme-toggle-button"),
  themeToggleLabel: document.querySelector("#theme-toggle-label")
};

const optionsTranslations = {
  "pt-BR": {
    addSite: "Adicionar site",
    autoSitesLabel: "Sites automáticos",
    autoStartDescription:
      "Quando uma página desses sites abrir, o RecarregaAi! liga uma atualização separada para ela.",
    autoStartEyebrow: "Início automático",
    backToTop: "Voltar ao início",
    closeDialog: "Fechar",
    cleanupDescription:
      "Remove dados antigos do endereço aberto para buscar conteúdo novo.",
    cleanupTitle: "Limpeza do site",
    contactChannelsLabel: "Canais de contato",
    currentPageDescription:
      "Identifica a página atual para limpar dados e atualizar no tempo definido.",
    currentPageTitle: "Página escolhida",
    defaultIntervalPlaceholder: "Padrão",
    defaultTimeLabel: "Tempo padrão",
    documentTitle: "Configurações do RecarregaAi!",
    emptySitesDescription:
      "Adicione um endereço acima para o RecarregaAi! iniciar sozinho quando esse site abrir.",
    emptySitesTitle: "Nenhum site automático cadastrado.",
    footerFeedback: "Feedback",
    footerDeveloper: "Desenvolvido por:",
    footerHome: "Início",
    footerLegal: "© RecarregaAi! 1.7.4. Todos os direitos reservados.",
    footerPrivacy: "Privacidade",
    formInvalidInterval: "Informe um intervalo padrão de pelo menos 1 minuto.",
    formInvalidOrigin: "Use um endereço http ou https.",
    formPermissionDenied:
      "Permissão negada. Autorize este site para usar o início automático.",
    formSiteAddError: "Não consegui adicionar o site.",
    formSiteSaved: "Site salvo para iniciar automaticamente.",
    formSiteSaveError: "Erro ao salvar site.",
    formSiteRemoved: "Site removido.",
    formSiteRemoveError: "Erro ao remover site.",
    formSettingsError: "Erro ao salvar preferências.",
    formSettingsLoadError: "Erro ao carregar configurações.",
    formSettingsSaved: "Tempo padrão salvo.",
    formThemeError: "Erro ao alternar tema.",
    languageDialogDescription:
      "Escolha o idioma preferido para navegar pelo RecarregaAi!.",
    languageDialogTitle: "Idioma",
    languageGridLabel: "Idiomas disponíveis",
    languageLabel: "Idioma",
    linksLabel: "Links finais",
    localControlLabel: "Controle local",
    localControlText: "Configurações salvas no navegador.",
    localPreferencesDescription:
      "Salva tema, tempo padrão e sites cadastrados no seu navegador.",
    localPreferencesTitle: "Preferências locais",
    minutePlural: "{count} minutos",
    minuteSingular: "1 minuto",
    pageDescription:
      "Defina o tempo padrão, escolha sites de início automático e veja como o RecarregaAi! usa permissões.",
    pageTitle: "Configurações",
    permissionsDescription:
      "A extensão usa apenas o necessário para atualizar a página escolhida e salvar suas preferências localmente.",
    permissionsGridLabel: "Permissões usadas pela extensão",
    permissionsSummaryLabel: "Resumo das configurações",
    permissionsTitle: "Por que a extensão pede permissões?",
    preferencesEyebrow: "Preferências",
    readySitesEmpty: "Nenhum site cadastrado",
    readySitesPlural: "{count} sites cadastrados",
    readySitesSingular: "1 site cadastrado",
    removeSite: "Remover",
    saveDefaultInterval: "Salvar tempo padrão",
    siteAddressLabel: "Endereço do site",
    siteIntervalHint: "Deixe vazio para usar o tempo padrão.",
    siteIntervalLabel: "Tempo em minutos",
    siteListLabel: "Sites automáticos",
    siteMeta: "Atualiza a cada {interval}",
    sitesTitle: "Sites que iniciam sozinhos",
    authorizedSitesDescription:
      "Pede permissão somente para os sites adicionados ao início automático.",
    authorizedSitesTitle: "Sites autorizados",
    quickActionsLabel: "Ações rápidas",
    themeDark: "Tema escuro",
    themeLight: "Tema claro",
    themeToDark: "Mudar para o tema escuro",
    themeToLight: "Mudar para o tema claro",
    timeDescription:
      "Esse tempo é usado quando você cria uma atualização automática sem informar um intervalo específico.",
    transparencyEyebrow: "Transparência"
  },
  en: {
    addSite: "Add site",
    autoSitesLabel: "Automatic sites",
    autoStartDescription:
      "When one of these sites opens, RecarregaAi! starts a separate refresh for it.",
    autoStartEyebrow: "Automatic start",
    backToTop: "Back to top",
    closeDialog: "Close",
    cleanupDescription:
      "Removes old data from the open address to fetch fresh content.",
    cleanupTitle: "Site cleanup",
    contactChannelsLabel: "Contact channels",
    currentPageDescription:
      "Identifies the current page to clear data and refresh it on the chosen interval.",
    currentPageTitle: "Selected page",
    defaultIntervalPlaceholder: "Default",
    defaultTimeLabel: "Default time",
    documentTitle: "RecarregaAi! Settings",
    emptySitesDescription:
      "Add an address above so RecarregaAi! can start automatically when that site opens.",
    emptySitesTitle: "No automatic site added.",
    footerFeedback: "Feedback",
    footerDeveloper: "Developed by:",
    footerHome: "Home",
    footerLegal: "© RecarregaAi! 1.7.4. All rights reserved.",
    footerPrivacy: "Privacy",
    formInvalidInterval: "Enter a default interval of at least 1 minute.",
    formInvalidOrigin: "Use an http or https address.",
    formPermissionDenied:
      "Permission denied. Allow this site to use automatic start.",
    formSiteAddError: "I could not add the site.",
    formSiteSaved: "Site saved for automatic start.",
    formSiteSaveError: "Error saving site.",
    formSiteRemoved: "Site removed.",
    formSiteRemoveError: "Error removing site.",
    formSettingsError: "Error saving preferences.",
    formSettingsLoadError: "Error loading settings.",
    formSettingsSaved: "Default time saved.",
    formThemeError: "Error switching theme.",
    languageDialogDescription:
      "Choose your preferred language to browse RecarregaAi!.",
    languageDialogTitle: "Language",
    languageGridLabel: "Available languages",
    languageLabel: "Language",
    linksLabel: "Footer links",
    localControlLabel: "Local control",
    localControlText: "Settings saved in the browser.",
    localPreferencesDescription:
      "Saves theme, default time and registered sites in your browser.",
    localPreferencesTitle: "Local preferences",
    minutePlural: "{count} minutes",
    minuteSingular: "1 minute",
    pageDescription:
      "Set the default time, choose automatic-start sites and see how RecarregaAi! uses permissions.",
    pageTitle: "Settings",
    permissionsDescription:
      "The extension uses only what is necessary to refresh the selected page and save your preferences locally.",
    permissionsGridLabel: "Permissions used by the extension",
    permissionsSummaryLabel: "Settings summary",
    permissionsTitle: "Why does the extension ask for permissions?",
    preferencesEyebrow: "Preferences",
    readySitesEmpty: "No site added",
    readySitesPlural: "{count} sites added",
    readySitesSingular: "1 site added",
    removeSite: "Remove",
    saveDefaultInterval: "Save default time",
    siteAddressLabel: "Site address",
    siteIntervalHint: "Leave empty to use the default time.",
    siteIntervalLabel: "Time in minutes",
    siteListLabel: "Automatic sites",
    siteMeta: "Refreshes every {interval}",
    sitesTitle: "Sites that start automatically",
    authorizedSitesDescription:
      "Requests permission only for sites added to automatic start.",
    authorizedSitesTitle: "Authorized sites",
    quickActionsLabel: "Quick actions",
    themeDark: "Dark theme",
    themeLight: "Light theme",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    timeDescription:
      "This time is used when you create an automatic refresh without entering a specific interval.",
    transparencyEyebrow: "Transparency"
  },
  es: {
    addSite: "Agregar sitio",
    autoSitesLabel: "Sitios automáticos",
    autoStartDescription:
      "Cuando se abre una página de esos sitios, RecarregaAi! activa una actualización separada para ella.",
    autoStartEyebrow: "Inicio automático",
    backToTop: "Volver al inicio",
    closeDialog: "Cerrar",
    cleanupDescription:
      "Elimina datos antiguos de la dirección abierta para buscar contenido nuevo.",
    cleanupTitle: "Limpieza del sitio",
    contactChannelsLabel: "Canales de contacto",
    currentPageDescription:
      "Identifica la página actual para limpiar datos y actualizarla en el intervalo definido.",
    currentPageTitle: "Página seleccionada",
    defaultIntervalPlaceholder: "Predeterminado",
    defaultTimeLabel: "Tiempo predeterminado",
    documentTitle: "Configuración de RecarregaAi!",
    emptySitesDescription:
      "Agrega una dirección arriba para que RecarregaAi! se inicie solo cuando ese sitio se abra.",
    emptySitesTitle: "No hay sitios automáticos registrados.",
    footerFeedback: "Feedback",
    footerDeveloper: "Desarrollado por:",
    footerHome: "Inicio",
    footerLegal: "© RecarregaAi! 1.7.4. Todos los derechos reservados.",
    footerPrivacy: "Privacidad",
    formInvalidInterval: "Ingresa un intervalo predeterminado de al menos 1 minuto.",
    formInvalidOrigin: "Usa una dirección http o https.",
    formPermissionDenied:
      "Permiso denegado. Autoriza este sitio para usar el inicio automático.",
    formSiteAddError: "No pude agregar el sitio.",
    formSiteSaved: "Sitio guardado para inicio automático.",
    formSiteSaveError: "Error al guardar el sitio.",
    formSiteRemoved: "Sitio eliminado.",
    formSiteRemoveError: "Error al eliminar el sitio.",
    formSettingsError: "Error al guardar las preferencias.",
    formSettingsLoadError: "Error al cargar la configuración.",
    formSettingsSaved: "Tiempo predeterminado guardado.",
    formThemeError: "Error al cambiar el tema.",
    languageDialogDescription:
      "Elige el idioma preferido para navegar por RecarregaAi!.",
    languageDialogTitle: "Idioma",
    languageGridLabel: "Idiomas disponibles",
    languageLabel: "Idioma",
    linksLabel: "Enlaces finales",
    localControlLabel: "Control local",
    localControlText: "Configuración guardada en el navegador.",
    localPreferencesDescription:
      "Guarda tema, tiempo predeterminado y sitios registrados en tu navegador.",
    localPreferencesTitle: "Preferencias locales",
    minutePlural: "{count} minutos",
    minuteSingular: "1 minuto",
    pageDescription:
      "Define el tiempo predeterminado, elige sitios de inicio automático y mira cómo RecarregaAi! usa permisos.",
    pageTitle: "Configuración",
    permissionsDescription:
      "La extensión usa solo lo necesario para actualizar la página elegida y guardar tus preferencias localmente.",
    permissionsGridLabel: "Permisos usados por la extensión",
    permissionsSummaryLabel: "Resumen de la configuración",
    permissionsTitle: "¿Por qué la extensión solicita permisos?",
    preferencesEyebrow: "Preferencias",
    readySitesEmpty: "Ningún sitio registrado",
    readySitesPlural: "{count} sitios registrados",
    readySitesSingular: "1 sitio registrado",
    removeSite: "Eliminar",
    saveDefaultInterval: "Guardar tiempo predeterminado",
    siteAddressLabel: "Dirección del sitio",
    siteIntervalHint: "Déjalo vacío para usar el tiempo predeterminado.",
    siteIntervalLabel: "Tiempo en minutos",
    siteListLabel: "Sitios automáticos",
    siteMeta: "Actualiza cada {interval}",
    sitesTitle: "Sitios que se inician solos",
    authorizedSitesDescription:
      "Solicita permiso solo para los sitios agregados al inicio automático.",
    authorizedSitesTitle: "Sitios autorizados",
    quickActionsLabel: "Acciones rápidas",
    themeDark: "Tema oscuro",
    themeLight: "Tema claro",
    themeToDark: "Cambiar al tema oscuro",
    themeToLight: "Cambiar al tema claro",
    timeDescription:
      "Este tiempo se usa cuando creas una actualización automática sin informar un intervalo específico.",
    transparencyEyebrow: "Transparencia"
  }
};

let currentSettings = { ...defaultAppSettings };
let activeOptionsLanguage = defaultLanguage;

const getOptionsCopy = (key) => (
  optionsTranslations[activeOptionsLanguage]?.[key]
  || optionsTranslations[defaultLanguage][key]
  || key
);

const replaceOptionsToken = (key, replacements) => (
  Object.entries(replacements).reduce(
    (text, [token, value]) => text.replace(`{${token}}`, value),
    getOptionsCopy(key)
  )
);

const setText = (selector, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = getOptionsCopy(key);
  }
};

const setTexts = (selector, keys) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    const key = keys[index];

    if (key) {
      element.textContent = getOptionsCopy(key);
    }
  });
};

const setTextAt = (selector, index, key) => {
  const element = document.querySelectorAll(selector)[index];

  if (element) {
    element.textContent = getOptionsCopy(key);
  }
};

const setAttribute = (selector, attribute, key) => {
  const element = document.querySelector(selector);

  if (element) {
    element.setAttribute(attribute, getOptionsCopy(key));
  }
};

const getOptionsStorageArea = () => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return null;
  }

  return chrome.storage.local;
};

const getPreviewSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(optionsPreviewStorageKey)) || {};
  } catch {
    return {};
  }
};

const savePreviewSettings = (settings) => {
  localStorage.setItem(optionsPreviewStorageKey, JSON.stringify(settings));
};

const updateOptionsStatus = (message, status = "neutral") => {
  optionsElements.optionsStatus.textContent = message;
  optionsElements.optionsStatus.dataset.status = status;
};

const formatMinuteLabel = (minutes) => {
  if (minutes === 1) {
    return getOptionsCopy("minuteSingular");
  }

  return replaceOptionsToken("minutePlural", {
    count: String(minutes)
  });
};

const formatSiteCount = (count) => {
  if (count === 0) {
    return getOptionsCopy("readySitesEmpty");
  }

  if (count === 1) {
    return getOptionsCopy("readySitesSingular");
  }

  return replaceOptionsToken("readySitesPlural", {
    count: String(count)
  });
};

const updateSettingsSummary = () => {
  optionsElements.summaryDefaultInterval.textContent = formatMinuteLabel(
    currentSettings.defaultIntervalInMinutes
  );
  optionsElements.summarySitesCount.textContent = formatSiteCount(
    currentSettings.autoStartSites.length
  );
};

const getStoredOptionsSettings = async () => {
  const storageArea = getOptionsStorageArea();
  const storedData = storageArea
    ? await storageArea.get(storageKeys.appSettings)
    : {
      [storageKeys.appSettings]: getPreviewSettings()
    };
  const storedSettings = storedData[storageKeys.appSettings] || {};

  return {
    ...defaultAppSettings,
    ...storedSettings,
    autoStartSites: Array.isArray(storedSettings.autoStartSites)
      ? storedSettings.autoStartSites
      : []
  };
};

const saveOptionsSettings = async () => {
  const storageArea = getOptionsStorageArea();

  if (!storageArea) {
    savePreviewSettings(currentSettings);
    return;
  }

  await storageArea.set({
    [storageKeys.appSettings]: currentSettings
  });
};

const requestAutoStartPermission = async (origin) => {
  if (typeof chrome === "undefined" || !chrome.permissions?.request) {
    return true;
  }

  const originPattern = getPermissionPatternForOrigin(origin);

  return chrome.permissions.request({
    origins: [originPattern]
  });
};

const removeAutoStartPermissionIfUnused = async (origin) => {
  if (typeof chrome === "undefined" || !chrome.permissions?.remove) {
    return;
  }

  const originPattern = getPermissionPatternForOrigin(origin);
  const isStillUsed = currentSettings.autoStartSites.some((site) => (
    site.origin === origin
  ));

  if (isStillUsed) {
    return;
  }

  await chrome.permissions.remove({
    origins: [originPattern]
  });
};

const normalizeSiteOrigin = (inputValue) => {
  const trimmedValue = inputValue.trim();
  const urlValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
  const url = new URL(urlValue);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(getOptionsCopy("formInvalidOrigin"));
  }

  return url.origin;
};

const renderSites = () => {
  optionsElements.sitesList.innerHTML = "";

  const hasSites = currentSettings.autoStartSites.length > 0;

  optionsElements.sitesEmptyState.hidden = hasSites;
  optionsElements.sitesList.hidden = !hasSites;

  currentSettings.autoStartSites.forEach((site, index) => {
    const item = document.createElement("li");
    const info = document.createElement("span");
    const origin = document.createElement("span");
    const meta = document.createElement("span");
    const removeButton = document.createElement("button");

    item.className = "site-list__item";
    info.className = "site-list__info";
    origin.className = "site-list__origin";
    meta.className = "site-list__meta";
    removeButton.className = "button button--danger";
    removeButton.type = "button";
    removeButton.dataset.removeIndex = String(index);

    origin.textContent = site.origin;
    meta.textContent = replaceOptionsToken("siteMeta", {
      interval: formatMinuteLabel(site.intervalInMinutes)
    });
    removeButton.textContent = getOptionsCopy("removeSite");

    info.append(origin, meta);
    item.append(info, removeButton);
    optionsElements.sitesList.append(item);
  });

  updateSettingsSummary();
};

const loadOptionsSettings = async () => {
  currentSettings = await getStoredOptionsSettings();
  optionsElements.defaultIntervalInput.value = currentSettings.defaultIntervalInMinutes;
  updateSettingsSummary();
  renderSites();
};

const saveDefaultInterval = async () => {
  const defaultInterval = Number(optionsElements.defaultIntervalInput.value);

  if (!Number.isFinite(defaultInterval) || defaultInterval < 1) {
    updateOptionsStatus(
      getOptionsCopy("formInvalidInterval"),
      "error"
    );
    return;
  }

  currentSettings.defaultIntervalInMinutes = Math.floor(defaultInterval);
  await saveOptionsSettings();
  updateSettingsSummary();
  updateOptionsStatus(getOptionsCopy("formSettingsSaved"), "success");
};

const addAutoStartSite = async () => {
  try {
    const origin = normalizeSiteOrigin(optionsElements.siteOriginInput.value);
    const hasPermission = await requestAutoStartPermission(origin);

    if (!hasPermission) {
      updateOptionsStatus(
        getOptionsCopy("formPermissionDenied"),
        "error"
      );
      return;
    }

    const rawInterval = Number(optionsElements.siteIntervalInput.value);
    const intervalInMinutes = Number.isFinite(rawInterval) && rawInterval >= 1
      ? Math.floor(rawInterval)
      : currentSettings.defaultIntervalInMinutes;

    currentSettings.autoStartSites = currentSettings.autoStartSites
      .filter((site) => site.origin !== origin);
    currentSettings.autoStartSites.push({
      enabled: true,
      intervalInMinutes,
      origin
    });

    await saveOptionsSettings();
    renderSites();

    optionsElements.siteOriginInput.value = "";
    optionsElements.siteIntervalInput.value = "";
    updateOptionsStatus(getOptionsCopy("formSiteSaved"), "success");
  } catch (error) {
    updateOptionsStatus(
      error.message || getOptionsCopy("formSiteAddError"),
      "error"
    );
  }
};

const removeAutoStartSite = async (index) => {
  const removedSite = currentSettings.autoStartSites[index];

  currentSettings.autoStartSites.splice(index, 1);
  await saveOptionsSettings();

  if (removedSite?.origin) {
    await removeAutoStartPermissionIfUnused(removedSite.origin);
  }

  renderSites();
  updateOptionsStatus(getOptionsCopy("formSiteRemoved"), "success");
};

const updateOptionsThemeButtonLabel = ({ isDarkTheme }) => {
  const nextThemeLabel = isDarkTheme
    ? getOptionsCopy("themeToLight")
    : getOptionsCopy("themeToDark");

  optionsElements.themeToggleButton.setAttribute("aria-pressed", String(isDarkTheme));
  optionsElements.themeToggleButton.setAttribute("aria-label", nextThemeLabel);
  optionsElements.themeToggleButton.title = nextThemeLabel;
  optionsElements.themeToggleLabel.textContent = isDarkTheme
    ? getOptionsCopy("themeLight")
    : getOptionsCopy("themeDark");
};

const loadOptionsTheme = async () => {
  await loadThemePreference({
    onChange: updateOptionsThemeButtonLabel
  });
};

const toggleOptionsTheme = async () => {
  await toggleThemePreference({
    onChange: updateOptionsThemeButtonLabel
  });
};

const loadOptionsVersion = () => {
  if (typeof chrome === "undefined" || !chrome.runtime?.getManifest) {
    return;
  }

  const manifest = chrome.runtime.getManifest();

  optionsElements.extensionVersion.textContent = manifest.version_name
    || `V.${manifest.version}`;
};

const applyOptionsLanguage = (language) => {
  activeOptionsLanguage = optionsTranslations[language]
    ? language
    : defaultLanguage;
  document.title = getOptionsCopy("documentTitle");

  setText("#options-title", "pageTitle");
  setText(".brand__subtitle", "pageDescription");
  setText(".panel--split .panel__eyebrow", "preferencesEyebrow");
  setText("#general-title", "defaultTimeLabel");
  setText(".panel--split .panel__description", "timeDescription");
  setText(".settings-row .field__label", "siteIntervalLabel");
  setText("#save-settings-button", "saveDefaultInterval");
  setText("#sites-title", "sitesTitle");
  setText(".site-form .field:nth-child(1) .field__label", "siteAddressLabel");
  setText(".site-form .field:nth-child(2) .field__label", "siteIntervalLabel");
  setText(".site-form .field__hint", "siteIntervalHint");
  setText("#add-site-button", "addSite");
  setText(".empty-state strong", "emptySitesTitle");
  setText(".empty-state span", "emptySitesDescription");
  setText("#permissions-title", "permissionsTitle");
  setTextAt(".summary-card strong", 0, "defaultTimeLabel");
  setTextAt(".summary-card strong", 1, "autoSitesLabel");
  setTextAt(".summary-card strong", 2, "localControlLabel");
  setTextAt(".summary-card div > span", 2, "localControlText");
  setTextAt(".panel .panel__eyebrow", 1, "autoStartEyebrow");
  setTextAt(".panel .panel__description", 1, "autoStartDescription");
  setTextAt(".panel .panel__eyebrow", 2, "transparencyEyebrow");
  setTextAt(".panel .panel__description", 2, "permissionsDescription");
  setTexts(".permission-card strong", [
    "currentPageTitle",
    "cleanupTitle",
    "authorizedSitesTitle",
    "localPreferencesTitle"
  ]);
  setTexts(".permission-card p", [
    "currentPageDescription",
    "cleanupDescription",
    "authorizedSitesDescription",
    "localPreferencesDescription"
  ]);
  setTexts(".privacy-footer__nav a", [
    "footerHome",
    "footerPrivacy",
    "footerFeedback"
  ]);
  setText(".privacy-footer__legal", "footerLegal");
  setText(".privacy-footer__developer-label", "footerDeveloper");
  setText("#open-language-button .floating-action__label", "languageLabel");
  setText("#back-to-top-button .floating-action__label", "backToTop");
  setText("#language-dialog-title", "languageDialogTitle");
  setText(".language-dialog__description", "languageDialogDescription");

  optionsElements.siteIntervalInput.placeholder = getOptionsCopy(
    "defaultIntervalPlaceholder"
  );

  setAttribute(".summary-grid", "aria-label", "permissionsSummaryLabel");
  setAttribute(".permissions-grid", "aria-label", "permissionsGridLabel");
  setAttribute("#sites-list", "aria-label", "siteListLabel");
  setAttribute(".privacy-footer__nav", "aria-label", "linksLabel");
  setAttribute(".privacy-footer__social", "aria-label", "contactChannelsLabel");
  setAttribute(".language-grid", "aria-label", "languageGridLabel");
  setAttribute(".floating-tools", "aria-label", "quickActionsLabel");
  setAttribute("#open-language-button", "aria-label", "languageLabel");
  setAttribute("#back-to-top-button", "aria-label", "backToTop");
  setAttribute("#close-language-button", "aria-label", "closeDialog");

  updateSettingsSummary();
  renderSites();
  updateOptionsThemeButtonLabel({
    isDarkTheme: document.documentElement.dataset.theme === "dark"
  });
};

optionsElements.saveSettingsButton.addEventListener("click", () => {
  saveDefaultInterval().catch((error) => {
    updateOptionsStatus(
      error.message || getOptionsCopy("formSettingsError"),
      "error"
    );
  });
});

optionsElements.addSiteButton.addEventListener("click", () => {
  addAutoStartSite().catch((error) => {
    updateOptionsStatus(error.message || getOptionsCopy("formSiteSaveError"), "error");
  });
});

optionsElements.sitesList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-index]");

  if (!removeButton) {
    return;
  }

  removeAutoStartSite(Number(removeButton.dataset.removeIndex)).catch((error) => {
    updateOptionsStatus(error.message || getOptionsCopy("formSiteRemoveError"), "error");
  });
});

optionsElements.themeToggleButton.addEventListener("click", () => {
  toggleOptionsTheme().catch((error) => {
    updateOptionsStatus(error.message || getOptionsCopy("formThemeError"), "error");
  });
});

initFloatingTools();
initLanguageDialog({
  onChange: applyOptionsLanguage,
  storageKey: "recarregaAiPageLanguage"
});

loadOptionsVersion();
loadOptionsTheme().catch((error) => {
  updateOptionsStatus(error.message || "Erro ao carregar tema.", "error");
});
loadOptionsSettings().catch((error) => {
  updateOptionsStatus(
    error.message || "Erro ao carregar configurações.",
    "error"
  );
});
