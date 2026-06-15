// RecarregaAi! V.1.2.6

const welcomeThemeStorageKey = "recarregaAiTheme";

const welcomeThemeModes = {
  dark: "dark",
  light: "light"
};

const welcomeElements = {
  finishButton: document.querySelector("#finish-welcome-button"),
  themeToggleButton: document.querySelector("#theme-toggle-button")
};

const applyWelcomeTheme = (theme) => {
  const nextTheme = theme === welcomeThemeModes.light
    ? welcomeThemeModes.light
    : welcomeThemeModes.dark;
  const isDarkTheme = nextTheme === welcomeThemeModes.dark;

  document.documentElement.dataset.theme = nextTheme;
  welcomeElements.themeToggleButton.textContent = isDarkTheme
    ? "Tema claro"
    : "Tema escuro";
};

const loadWelcomeTheme = async () => {
  const storedData = await chrome.storage.local.get(welcomeThemeStorageKey);

  applyWelcomeTheme(storedData[welcomeThemeStorageKey] || welcomeThemeModes.dark);
};

const toggleWelcomeTheme = async () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === welcomeThemeModes.dark
    ? welcomeThemeModes.light
    : welcomeThemeModes.dark;

  applyWelcomeTheme(nextTheme);

  await chrome.storage.local.set({
    [welcomeThemeStorageKey]: nextTheme
  });
};

const finishWelcome = async () => {
  await chrome.storage.local.set({
    recarregaAiWelcomeSeenAt: new Date().toISOString()
  });

  const currentTab = await chrome.tabs.getCurrent();

  if (typeof currentTab?.id === "number") {
    await chrome.tabs.remove(currentTab.id);
    return;
  }

  window.close();
};

welcomeElements.themeToggleButton.addEventListener("click", () => {
  toggleWelcomeTheme().catch((error) => {
    console.error("Erro ao alternar tema da boas-vindas:", error);
  });
});

welcomeElements.finishButton.addEventListener("click", () => {
  finishWelcome().catch((error) => {
    console.error("Erro ao finalizar boas-vindas:", error);
  });
});

loadWelcomeTheme().catch((error) => {
  console.error("Erro ao carregar tema da boas-vindas:", error);
});
