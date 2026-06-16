// RecarregaAi! V.1.4.8

import {
  loadThemePreference,
  toggleThemePreference
} from "./modules/theme.js";

const welcomeLanguageStorageKey = "recarregaAiWelcomeLanguage";
const defaultWelcomeLanguage = "pt-BR";

const supportedWelcomeLanguages = ["pt-BR", "en", "es"];

const welcomeElements = {
  backToTopButton: document.querySelector("#back-to-top-button"),
  closeLanguageButton: document.querySelector("#close-language-button"),
  finishButtons: document.querySelectorAll("[data-finish-welcome]"),
  languageBackdrop: document.querySelector("[data-close-language]"),
  languageDialog: document.querySelector("#language-dialog"),
  languageOptionButtons: document.querySelectorAll("[data-language-option]"),
  openLanguageButton: document.querySelector("#open-language-button"),
  themeToggleButton: document.querySelector("#theme-toggle-button")
};

const getChromeLocalStorage = () => {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return null;
  }

  return chrome.storage.local;
};

const getChromeTabs = () => {
  if (typeof chrome === "undefined" || !chrome.tabs) {
    return null;
  }

  return chrome.tabs;
};

const updateThemeButtonLabel = (isDarkTheme) => {
  const nextLabel = isDarkTheme ? "Tema claro" : "Tema escuro";

  welcomeElements.themeToggleButton.setAttribute("aria-label", nextLabel);
  welcomeElements.themeToggleButton.setAttribute("title", nextLabel);
};

const handleWelcomeThemeChange = ({ isDarkTheme }) => {
  updateThemeButtonLabel(isDarkTheme);
};

const normalizeWelcomeLanguage = (language) => {
  return supportedWelcomeLanguages.includes(language)
    ? language
    : defaultWelcomeLanguage;
};

const applyWelcomeLanguage = (language) => {
  const nextLanguage = normalizeWelcomeLanguage(language);

  document.documentElement.lang = nextLanguage;

  welcomeElements.languageOptionButtons.forEach((button) => {
    const isSelected = button.dataset.languageOption === nextLanguage;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
};

const loadWelcomeTheme = async () => {
  await loadThemePreference({
    onChange: handleWelcomeThemeChange,
    storageArea: getChromeLocalStorage()
  });
};

const loadWelcomeLanguage = async () => {
  const storageArea = getChromeLocalStorage();

  if (!storageArea) {
    applyWelcomeLanguage(defaultWelcomeLanguage);
    return;
  }

  const storedData = await storageArea.get(welcomeLanguageStorageKey);

  applyWelcomeLanguage(storedData[welcomeLanguageStorageKey]);
};

const toggleWelcomeTheme = async () => {
  await toggleThemePreference({
    onChange: handleWelcomeThemeChange,
    storageArea: getChromeLocalStorage()
  });
};

const saveWelcomeLanguage = async (language) => {
  const storageArea = getChromeLocalStorage();
  const nextLanguage = normalizeWelcomeLanguage(language);

  applyWelcomeLanguage(nextLanguage);

  if (storageArea) {
    await storageArea.set({
      [welcomeLanguageStorageKey]: nextLanguage
    });
  }
};

const openLanguageDialog = () => {
  welcomeElements.languageDialog.hidden = false;
  document.body.classList.add("has-open-dialog");

  const selectedButton = document.querySelector(".language-card.is-selected");
  (selectedButton || welcomeElements.closeLanguageButton).focus();
};

const closeLanguageDialog = () => {
  welcomeElements.languageDialog.hidden = true;
  document.body.classList.remove("has-open-dialog");
  welcomeElements.openLanguageButton.focus();
};

const backToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const finishWelcome = async () => {
  const storageArea = getChromeLocalStorage();
  const tabsApi = getChromeTabs();

  if (storageArea) {
    await storageArea.set({
      recarregaAiWelcomeSeenAt: new Date().toISOString()
    });
  }

  if (tabsApi?.getCurrent && tabsApi?.remove) {
    const currentTab = await tabsApi.getCurrent();

    if (typeof currentTab?.id === "number") {
      await tabsApi.remove(currentTab.id);
      return;
    }
  }

  window.close();
};

welcomeElements.themeToggleButton.addEventListener("click", () => {
  toggleWelcomeTheme().catch((error) => {
    console.error("Erro ao alternar tema da boas-vindas:", error);
  });
});

welcomeElements.openLanguageButton.addEventListener("click", () => {
  openLanguageDialog();
});

welcomeElements.closeLanguageButton.addEventListener("click", () => {
  closeLanguageDialog();
});

welcomeElements.languageBackdrop.addEventListener("click", () => {
  closeLanguageDialog();
});

welcomeElements.languageOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    saveWelcomeLanguage(button.dataset.languageOption).catch((error) => {
      console.error("Erro ao salvar idioma da boas-vindas:", error);
    });
    closeLanguageDialog();
  });
});

welcomeElements.backToTopButton.addEventListener("click", () => {
  backToTop();
});

welcomeElements.finishButtons.forEach((button) => {
  button.addEventListener("click", () => {
    finishWelcome().catch((error) => {
      console.error("Erro ao finalizar boas-vindas:", error);
    });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !welcomeElements.languageDialog.hidden) {
    closeLanguageDialog();
  }
});

Promise.all([
  loadWelcomeTheme(),
  loadWelcomeLanguage()
]).catch((error) => {
  console.error("Erro ao carregar boas-vindas:", error);
});
