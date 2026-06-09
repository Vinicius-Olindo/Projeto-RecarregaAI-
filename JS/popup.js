const timerSettingsKey = "recarregaAiTimerSettings";
const themeStorageKey = "recarregaAiTheme";

const themeModes = {
  dark: "dark",
  light: "light"
};

const runtimeMessageTypes = {
  getTimerState: "RECARREGA_AI_GET_TIMER_STATE",
  openTimerTab: "RECARREGA_AI_OPEN_TIMER_TAB",
  pauseTimer: "RECARREGA_AI_PAUSE_TIMER",
  resumeTimer: "RECARREGA_AI_RESUME_TIMER",
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER"
};

const popupElements = {
  controlledTabTitle: document.querySelector("#controlled-tab-title"),
  controlledTabUrl: document.querySelector("#controlled-tab-url"),
  customTimerInput: document.querySelector("#custom-timer-input"),
  extensionVersion: document.querySelector("#extension-version"),
  openControlledTabButton: document.querySelector("#open-controlled-tab-button"),
  openOptionsButton: document.querySelector("#open-options-button"),
  pauseTimerButton: document.querySelector("#pause-timer-button"),
  popupCountdown: document.querySelector("#popup-countdown"),
  reloadPageButton: document.querySelector("#reload-page-button"),
  resumeTimerButton: document.querySelector("#resume-timer-button"),
  startTimerButton: document.querySelector("#start-timer-button"),
  statusPanel: document.querySelector(".popup__status"),
  statusMessage: document.querySelector("#status-message"),
  stopTimerButton: document.querySelector("#stop-timer-button"),
  themeToggleButton: document.querySelector("#theme-toggle-button"),
  themeToggleLabel: document.querySelector("#theme-toggle-label"),
  timerOverview: document.querySelector("#timer-overview"),
  timerIntervalInputs: document.querySelectorAll("[name='timer-interval']")
};

const unsupportedPageMessage = "Essa pagina nao permite limpeza de cache pela extensao.";
const defaultReloadButtonText = "Limpar e recarregar";
const defaultStartTimerButtonText = "Ativar timer";
const presetTimerIntervals = [3, 5, 10];

const cacheDataTypes = {
  cache: true,
  cacheStorage: true,
  serviceWorkers: true
};

const updateStatusMessage = (message, status = "neutral") => {
  popupElements.statusMessage.textContent = message;
  popupElements.statusPanel.dataset.status = status;
};

const updateButtonState = (button, isLoading, loadingText, defaultText) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
  button.classList.toggle("is-loading", isLoading);
};

const loadExtensionVersion = () => {
  const manifest = chrome.runtime.getManifest();

  popupElements.extensionVersion.textContent = manifest.version_name
    || `V.${manifest.version}`;
};

const applyTheme = (theme) => {
  const nextTheme = theme === themeModes.light
    ? themeModes.light
    : themeModes.dark;
  const isDarkTheme = nextTheme === themeModes.dark;

  document.documentElement.dataset.theme = nextTheme;
  popupElements.themeToggleButton.setAttribute("aria-pressed", String(isDarkTheme));
  popupElements.themeToggleButton.title = isDarkTheme
    ? "Mudar para tema claro"
    : "Mudar para tema escuro";
  popupElements.themeToggleLabel.textContent = isDarkTheme ? "Claro" : "Escuro";
};

const loadTheme = async () => {
  const storedData = await chrome.storage.local.get(themeStorageKey);

  applyTheme(storedData[themeStorageKey] || themeModes.dark);
};

const toggleTheme = async () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === themeModes.dark
    ? themeModes.light
    : themeModes.dark;

  applyTheme(nextTheme);

  await chrome.storage.local.set({
    [themeStorageKey]: nextTheme
  });
};

const sendRuntimeMessage = (message) => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage(message, (response) => {
    const runtimeError = chrome.runtime.lastError;

    if (runtimeError) {
      reject(new Error(runtimeError.message));
      return;
    }

    if (response?.ok === false) {
      reject(new Error(response.error));
      return;
    }

    resolve(response);
  });
});

const getActiveTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return activeTab;
};

const getUrlOrigin = (urlValue) => {
  try {
    const url = new URL(urlValue);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.origin;
  } catch (error) {
    console.error("URL invalida para limpeza de cache:", error);
    return null;
  }
};

const collectFrameOrigins = () => {
  const allowedProtocols = ["http:", "https:"];
  const origins = new Set();

  const addOriginFromUrl = (urlValue) => {
    if (!urlValue) {
      return;
    }

    try {
      const url = new URL(urlValue, window.location.href);

      if (allowedProtocols.includes(url.protocol)) {
        origins.add(url.origin);
      }
    } catch (error) {
      console.debug("URL ignorada pelo RecarregaAi:", error);
    }
  };

  addOriginFromUrl(window.location.href);

  performance.getEntries().forEach((entry) => {
    addOriginFromUrl(entry.name);
  });

  document.querySelectorAll("[href], [src]").forEach((element) => {
    addOriginFromUrl(element.href);
    addOriginFromUrl(element.src);
    addOriginFromUrl(element.currentSrc);
    addOriginFromUrl(element.getAttribute("href"));
    addOriginFromUrl(element.getAttribute("src"));
  });

  return Array.from(origins);
};

const collectLoadedOrigins = async (tabId, mainOrigin) => {
  const origins = new Set([mainOrigin]);

  try {
    const frameResults = await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      func: collectFrameOrigins
    });

    frameResults.forEach((frameResult) => {
      if (!Array.isArray(frameResult.result)) {
        return;
      }

      frameResult.result.forEach((origin) => {
        origins.add(origin);
      });
    });
  } catch (error) {
    console.warn("Nao foi possivel coletar todas as origens carregadas:", error);
  }

  return Array.from(origins);
};

const clearPageCache = async (origins) => {
  await chrome.browsingData.remove(
    {
      origins
    },
    cacheDataTypes
  );
};

const reloadCurrentPageIgnoringCache = async (tabId) => {
  await chrome.tabs.reload(tabId, {
    bypassCache: true
  });
};

const clearCacheAndReloadCurrentPage = async () => {
  try {
    updateButtonState(
      popupElements.reloadPageButton,
      true,
      "Limpando...",
      defaultReloadButtonText
    );
    updateStatusMessage("Coletando recursos carregados pela pagina...", "working");

    const activeTab = await getActiveTab();

    if (typeof activeTab?.id !== "number") {
      updateStatusMessage("Nao foi possivel encontrar a aba atual.", "error");
      return;
    }

    const origin = getUrlOrigin(activeTab.url);

    if (!origin) {
      updateStatusMessage(unsupportedPageMessage, "error");
      return;
    }

    const loadedOrigins = await collectLoadedOrigins(activeTab.id, origin);

    updateStatusMessage(
      `Limpando cache de ${loadedOrigins.length} origem(ns)...`,
      "working"
    );

    await clearPageCache(loadedOrigins);
    await reloadCurrentPageIgnoringCache(activeTab.id);

    updateStatusMessage("Cache limpo e pagina recarregada.", "success");
  } catch (error) {
    console.error("Erro ao limpar cache e recarregar:", error);
    updateStatusMessage("Nao foi possivel limpar o cache agora.", "error");
  } finally {
    updateButtonState(
      popupElements.reloadPageButton,
      false,
      "Limpando...",
      defaultReloadButtonText
    );
  }
};

const getSelectedTimerInterval = () => {
  const selectedTimerInput = document.querySelector("[name='timer-interval']:checked");

  if (selectedTimerInput?.value !== "custom") {
    return Number(selectedTimerInput.value);
  }

  const customInterval = Number(popupElements.customTimerInput.value);

  if (!Number.isFinite(customInterval) || customInterval < 1) {
    throw new Error("Informe um tempo personalizado de pelo menos 1 minuto.");
  }

  return Math.floor(customInterval);
};

const formatTimerInterval = (intervalInMinutes) => {
  if (intervalInMinutes === 1) {
    return "1 minuto";
  }

  return `${intervalInMinutes} minutos`;
};

const getRemainingSeconds = (nextRunAt) => {
  if (!nextRunAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((new Date(nextRunAt).getTime() - Date.now()) / 1000)
  );
};

const formatCountdownTime = (remainingSeconds) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
};

const getTimerState = async () => (
  sendRuntimeMessage({
    type: runtimeMessageTypes.getTimerState
  })
);

const getTimerTabLabel = (timerSettings) => (
  timerSettings.tabTitle || timerSettings.mainOrigin || "Guia controlada"
);

const updateTimerActionButtons = (timerSettings, activeTab) => {
  const hasTimer = Boolean(timerSettings?.enabled);
  const isCurrentControlledTab = hasTimer && activeTab?.id === timerSettings.tabId;
  const isPaused = Boolean(timerSettings?.paused);

  popupElements.openControlledTabButton.hidden = !hasTimer || isCurrentControlledTab;
  popupElements.pauseTimerButton.hidden = !hasTimer || isPaused;
  popupElements.resumeTimerButton.hidden = !hasTimer || !isPaused;
  popupElements.stopTimerButton.disabled = !hasTimer;
};

const updateTimerOverview = async (timerSettings) => {
  const activeTab = await getActiveTab();

  if (!timerSettings?.enabled) {
    popupElements.timerOverview.dataset.state = "empty";
    popupElements.controlledTabTitle.textContent = "Nenhuma guia monitorada";
    popupElements.controlledTabUrl.textContent = "Ative o timer para iniciar.";
    popupElements.popupCountdown.textContent = "--:--";
    updateTimerActionButtons(timerSettings, activeTab);
    return;
  }

  const isPaused = Boolean(timerSettings.paused);
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  const isWarning = !isPaused && remainingSeconds <= 10;
  const state = isPaused ? "paused" : isWarning ? "warning" : "active";

  popupElements.timerOverview.dataset.state = state;
  popupElements.controlledTabTitle.textContent = getTimerTabLabel(timerSettings);
  popupElements.controlledTabUrl.textContent = timerSettings.tabUrl
    || timerSettings.mainOrigin
    || "Origem nao identificada";
  popupElements.popupCountdown.textContent = isPaused
    ? "Pausado"
    : formatCountdownTime(remainingSeconds);

  updateTimerActionButtons(timerSettings, activeTab);
};

const refreshTimerState = async ({ updateStatus = false } = {}) => {
  const response = await getTimerState();
  const timerSettings = response.timerSettings;

  await updateTimerOverview(timerSettings);

  if (!updateStatus) {
    return timerSettings;
  }

  if (!timerSettings?.enabled) {
    updateStatusMessage("Nenhuma guia sendo monitorada agora.", "neutral");
    return timerSettings;
  }

  const activeTab = await getActiveTab();
  const timerIntervalText = formatTimerInterval(timerSettings.intervalInMinutes);

  if (timerSettings.paused) {
    updateStatusMessage("Timer pausado.", "warning");
    return timerSettings;
  }

  if (activeTab?.id === timerSettings.tabId) {
    updateStatusMessage(
      `Timer ativo nesta guia: a cada ${timerIntervalText}.`,
      "active"
    );
    return timerSettings;
  }

  updateStatusMessage(
    "Timer ativo em outra guia. Use Abrir guia para ir ate ela.",
    "warning"
  );

  return timerSettings;
};

const syncCustomTimerInputState = () => {
  const selectedTimerInput = document.querySelector("[name='timer-interval']:checked");
  const isCustomTimer = selectedTimerInput?.value === "custom";

  popupElements.customTimerInput.disabled = !isCustomTimer;

  if (isCustomTimer) {
    popupElements.customTimerInput.focus();
  }
};

const selectTimerInterval = (intervalInMinutes) => {
  const presetValue = presetTimerIntervals.includes(intervalInMinutes)
    ? String(intervalInMinutes)
    : "custom";

  const timerInput = document.querySelector(`[name='timer-interval'][value='${presetValue}']`);

  if (timerInput) {
    timerInput.checked = true;
  }

  if (presetValue === "custom") {
    popupElements.customTimerInput.value = intervalInMinutes;
  }

  syncCustomTimerInputState();
};

const loadTimerState = async () => {
  const timerSettings = await refreshTimerState({
    updateStatus: true
  });

  if (timerSettings?.intervalInMinutes) {
    selectTimerInterval(timerSettings.intervalInMinutes);
  }
};

const startTimer = async () => {
  try {
    updateButtonState(
      popupElements.startTimerButton,
      true,
      "Ativando...",
      defaultStartTimerButtonText
    );
    updateStatusMessage("Preparando timer para a aba atual...", "working");

    const activeTab = await getActiveTab();

    if (typeof activeTab?.id !== "number") {
      updateStatusMessage("Nao foi possivel encontrar a aba atual.", "error");
      return;
    }

    const origin = getUrlOrigin(activeTab.url);

    if (!origin) {
      updateStatusMessage(unsupportedPageMessage, "error");
      return;
    }

    const intervalInMinutes = getSelectedTimerInterval();
    const loadedOrigins = await collectLoadedOrigins(activeTab.id, origin);

    await sendRuntimeMessage({
      type: runtimeMessageTypes.startTimer,
      payload: {
        intervalInMinutes,
        mainOrigin: origin,
        origins: loadedOrigins,
        tabId: activeTab.id,
        tabTitle: activeTab.title,
        tabUrl: activeTab.url,
        windowId: activeTab.windowId
      }
    });

    updateStatusMessage(
      `Timer ativo: a cada ${formatTimerInterval(intervalInMinutes)}.`,
      "active"
    );
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao ativar timer:", error);
    updateStatusMessage(
      error.message || "Nao foi possivel ativar o timer agora.",
      "error"
    );
  } finally {
    updateButtonState(
      popupElements.startTimerButton,
      false,
      "Ativando...",
      defaultStartTimerButtonText
    );
  }
};

const stopTimer = async () => {
  try {
    await sendRuntimeMessage({
      type: runtimeMessageTypes.stopTimer
    });

    await refreshTimerState();
    updateStatusMessage("Timer parado.", "warning");
  } catch (error) {
    console.error("Erro ao parar timer:", error);
    updateStatusMessage("Nao foi possivel parar o timer agora.", "error");
  }
};

const pauseTimer = async () => {
  try {
    await sendRuntimeMessage({
      type: runtimeMessageTypes.pauseTimer
    });

    updateStatusMessage("Timer pausado.", "warning");
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao pausar timer:", error);
    updateStatusMessage("Nao foi possivel pausar o timer agora.", "error");
  }
};

const resumeTimer = async () => {
  try {
    await sendRuntimeMessage({
      type: runtimeMessageTypes.resumeTimer
    });

    updateStatusMessage("Timer retomado.", "active");
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao retomar timer:", error);
    updateStatusMessage("Nao foi possivel retomar o timer agora.", "error");
  }
};

const openControlledTab = async () => {
  try {
    await sendRuntimeMessage({
      type: runtimeMessageTypes.openTimerTab
    });
  } catch (error) {
    console.error("Erro ao abrir guia controlada:", error);
    updateStatusMessage("Nao foi possivel abrir a guia controlada.", "error");
  }
};

const openOptionsPage = () => {
  chrome.runtime.openOptionsPage();
};

popupElements.reloadPageButton.addEventListener("click", clearCacheAndReloadCurrentPage);
popupElements.openControlledTabButton.addEventListener("click", openControlledTab);
popupElements.openOptionsButton.addEventListener("click", openOptionsPage);
popupElements.pauseTimerButton.addEventListener("click", pauseTimer);
popupElements.resumeTimerButton.addEventListener("click", resumeTimer);
popupElements.startTimerButton.addEventListener("click", startTimer);
popupElements.stopTimerButton.addEventListener("click", stopTimer);
popupElements.themeToggleButton.addEventListener("click", () => {
  toggleTheme().catch((error) => {
    console.error("Erro ao alternar tema:", error);
  });
});

popupElements.timerIntervalInputs.forEach((timerInput) => {
  timerInput.addEventListener("change", syncCustomTimerInputState);
});

syncCustomTimerInputState();
loadExtensionVersion();
loadTheme().catch((error) => {
  console.error("Erro ao carregar tema:", error);
});
loadTimerState().catch((error) => {
  console.error("Erro ao carregar estado do timer:", error);
});

setInterval(() => {
  refreshTimerState().catch((error) => {
    console.error("Erro ao atualizar estado do timer:", error);
  });
}, 1000);
