const optionsSettingsKey = "recarregaAiSettings";
const optionsThemeKey = "recarregaAiTheme";

const defaultOptionsSettings = {
  autoStartSites: [],
  defaultIntervalInMinutes: 3
};

const optionsThemeModes = {
  dark: "dark",
  light: "light"
};

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
  themeToggleButton: document.querySelector("#theme-toggle-button")
};

let currentSettings = { ...defaultOptionsSettings };

const updateOptionsStatus = (message) => {
  optionsElements.optionsStatus.textContent = message;
};

const getStoredOptionsSettings = async () => {
  const storedData = await chrome.storage.local.get(optionsSettingsKey);
  const storedSettings = storedData[optionsSettingsKey] || {};

  return {
    ...defaultOptionsSettings,
    ...storedSettings,
    autoStartSites: Array.isArray(storedSettings.autoStartSites)
      ? storedSettings.autoStartSites
      : []
  };
};

const saveOptionsSettings = async () => {
  await chrome.storage.local.set({
    [optionsSettingsKey]: currentSettings
  });
};

const normalizeSiteOrigin = (inputValue) => {
  const trimmedValue = inputValue.trim();
  const urlValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
  const url = new URL(urlValue);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Use um endereco http ou https.");
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
    meta.textContent = `Intervalo: ${site.intervalInMinutes} minuto(s)`;
    removeButton.textContent = "Remover";

    info.append(origin, meta);
    item.append(info, removeButton);
    optionsElements.sitesList.append(item);
  });
};

const loadOptionsSettings = async () => {
  currentSettings = await getStoredOptionsSettings();
  optionsElements.defaultIntervalInput.value = currentSettings.defaultIntervalInMinutes;
  renderSites();
};

const saveDefaultInterval = async () => {
  const defaultInterval = Number(optionsElements.defaultIntervalInput.value);

  if (!Number.isFinite(defaultInterval) || defaultInterval < 1) {
    updateOptionsStatus("Informe um intervalo padrao de pelo menos 1 minuto.");
    return;
  }

  currentSettings.defaultIntervalInMinutes = Math.floor(defaultInterval);
  await saveOptionsSettings();
  updateOptionsStatus("Preferencias salvas.");
};

const addAutoStartSite = async () => {
  try {
    const origin = normalizeSiteOrigin(optionsElements.siteOriginInput.value);
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
    updateOptionsStatus("Site automatico salvo.");
  } catch (error) {
    updateOptionsStatus(error.message || "Nao foi possivel adicionar o site.");
  }
};

const removeAutoStartSite = async (index) => {
  currentSettings.autoStartSites.splice(index, 1);
  await saveOptionsSettings();
  renderSites();
  updateOptionsStatus("Site removido.");
};

const applyOptionsTheme = (theme) => {
  const nextTheme = theme === optionsThemeModes.light
    ? optionsThemeModes.light
    : optionsThemeModes.dark;
  const isDarkTheme = nextTheme === optionsThemeModes.dark;

  document.documentElement.dataset.theme = nextTheme;
  optionsElements.themeToggleButton.textContent = isDarkTheme
    ? "Tema claro"
    : "Tema escuro";
};

const loadOptionsTheme = async () => {
  const storedData = await chrome.storage.local.get(optionsThemeKey);

  applyOptionsTheme(storedData[optionsThemeKey] || optionsThemeModes.dark);
};

const toggleOptionsTheme = async () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === optionsThemeModes.dark
    ? optionsThemeModes.light
    : optionsThemeModes.dark;

  applyOptionsTheme(nextTheme);

  await chrome.storage.local.set({
    [optionsThemeKey]: nextTheme
  });
};

const loadOptionsVersion = () => {
  const manifest = chrome.runtime.getManifest();

  optionsElements.extensionVersion.textContent = manifest.version_name
    || `V.${manifest.version}`;
};

optionsElements.saveSettingsButton.addEventListener("click", () => {
  saveDefaultInterval().catch((error) => {
    updateOptionsStatus(error.message || "Erro ao salvar preferencias.");
  });
});

optionsElements.addSiteButton.addEventListener("click", () => {
  addAutoStartSite().catch((error) => {
    updateOptionsStatus(error.message || "Erro ao salvar site.");
  });
});

optionsElements.sitesList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-index]");

  if (!removeButton) {
    return;
  }

  removeAutoStartSite(Number(removeButton.dataset.removeIndex)).catch((error) => {
    updateOptionsStatus(error.message || "Erro ao remover site.");
  });
});

optionsElements.themeToggleButton.addEventListener("click", () => {
  toggleOptionsTheme().catch((error) => {
    updateOptionsStatus(error.message || "Erro ao alternar tema.");
  });
});

loadOptionsVersion();
loadOptionsTheme().catch((error) => {
  updateOptionsStatus(error.message || "Erro ao carregar tema.");
});
loadOptionsSettings().catch((error) => {
  updateOptionsStatus(error.message || "Erro ao carregar configuracoes.");
});
