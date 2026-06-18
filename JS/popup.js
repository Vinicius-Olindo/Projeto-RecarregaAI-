// RecarregaAi! 1.8.6

import {
  formatCountdownTime,
  getPermissionPatternForOrigin,
  getRemainingSeconds,
  getUrlOrigin,
  pauseReasons,
  runtimeMessageTypes
} from "./modules/shared.js";
import {
  loadThemePreference,
  toggleThemePreference
} from "./modules/theme.js";
import {
  clearCacheForOrigins,
  reloadTabIgnoringCache
} from "./modules/cache.js";
import { collectLoadedOrigins } from "./modules/tabs.js";

const popupElements = {
  activeTimersCount: document.querySelector("#active-timers-count"),
  activeTimersList: document.querySelector("#active-timers-list"),
  activeTimersSection: document.querySelector("#active-timers-section"),
  controlledTabTitle: document.querySelector("#controlled-tab-title"),
  controlledTabUrl: document.querySelector("#controlled-tab-url"),
  customTimerInput: document.querySelector("#custom-timer-input"),
  extensionVersion: document.querySelector("#extension-version"),
  openControlledTabButton: document.querySelector("#open-controlled-tab-button"),
  openOptionsButton: document.querySelector("#open-options-button"),
  pauseTimerButton: document.querySelector("#pause-timer-button"),
  popupCountdown: document.querySelector("#popup-countdown"),
  reloadPageButton: document.querySelector("#reload-page-button"),
  removeTimerButton: document.querySelector("#remove-timer-button"),
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

const unsupportedPageMessage = "Esta página não permite esse tipo de limpeza.";
const defaultReloadButtonText = "Limpar e atualizar";
const defaultStartTimerButtonText = "Ligar atualização";
const presetTimerIntervals = [3, 5, 10];

let currentActiveTab = null;

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

const updateThemeButtonLabel = ({ isDarkTheme }) => {
  const nextThemeLabel = isDarkTheme
    ? "Mudar para o tema claro"
    : "Mudar para o tema escuro";

  popupElements.themeToggleButton.setAttribute("aria-pressed", String(isDarkTheme));
  popupElements.themeToggleButton.setAttribute("aria-label", nextThemeLabel);
  popupElements.themeToggleButton.title = nextThemeLabel;
  popupElements.themeToggleLabel.textContent = isDarkTheme ? "Claro" : "Escuro";
};

const loadTheme = async () => {
  await loadThemePreference({
    onChange: updateThemeButtonLabel
  });
};

const toggleTheme = async () => {
  await toggleThemePreference({
    onChange: updateThemeButtonLabel
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

const requestTimerPermission = async (origin) => (
  chrome.permissions.request({
    origins: [getPermissionPatternForOrigin(origin)]
  })
);

const clearCacheAndReloadCurrentPage = async () => {
  try {
    updateButtonState(
      popupElements.reloadPageButton,
      true,
      "Limpando...",
      defaultReloadButtonText
    );
    updateStatusMessage("Verificando o que precisa ser limpo...", "working");

    const activeTab = await getActiveTab();

    if (typeof activeTab?.id !== "number") {
      updateStatusMessage("Não consegui identificar a página aberta.", "error");
      return;
    }

    const origin = getUrlOrigin(activeTab.url);

    if (!origin) {
      updateStatusMessage(unsupportedPageMessage, "error");
      return;
    }

    const loadedOrigins = await collectLoadedOrigins(activeTab.id, [origin]);

    updateStatusMessage(
      "Limpando dados antigos desta página...",
      "working"
    );

    await clearCacheForOrigins(loadedOrigins);
    await reloadTabIgnoringCache(activeTab.id);

    updateStatusMessage("Página limpa e atualizada.", "success");
  } catch (error) {
    console.error("Erro ao limpar cache e recarregar:", error);
    updateStatusMessage("Não consegui limpar esta página agora.", "error");
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
    throw new Error("Informe pelo menos 1 minuto.");
  }

  return Math.floor(customInterval);
};

const formatTimerInterval = (intervalInMinutes) => {
  if (intervalInMinutes === 1) {
    return "1 minuto";
  }

  return `${intervalInMinutes} minutos`;
};

const getTimerState = async (activeTabId = null) => (
  sendRuntimeMessage({
    payload: {
      activeTabId
    },
    type: runtimeMessageTypes.getTimerState
  })
);

const getTimerTabLabel = (timerSettings) => (
  timerSettings.tabTitle || timerSettings.mainOrigin || "Página em atualização"
);

const formatActiveTimerCount = (count) => {
  if (count === 1) {
    return "1 página";
  }

  return `${count} páginas`;
};

const getTimerVisualState = (timerSettings) => {
  if (!timerSettings?.enabled) {
    return {
      countdownText: "--:--",
      state: "empty"
    };
  }

  const isPaused = Boolean(timerSettings.paused);
  const isPausedByMedia = timerSettings.pauseReason === pauseReasons.media;
  const isPausedByTyping = timerSettings.pauseReason === pauseReasons.typing;
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  const isWarning = !isPaused && remainingSeconds <= 10;
  let countdownText = formatCountdownTime(remainingSeconds);
  let state = "active";

  if (isWarning) {
    state = "warning";
  }

  if (isPaused) {
    state = "paused";
    countdownText = "Pausado";

    if (isPausedByTyping) {
      state = "typing";
      countdownText = "Digitando";
    }

    if (isPausedByMedia) {
      state = "media";
      countdownText = "Mídia";
    }
  }

  return {
    countdownText,
    state
  };
};

const updateTimerActionButtons = (timerSettings) => {
  const hasTimer = Boolean(timerSettings?.enabled);
  const isPaused = Boolean(timerSettings?.paused);

  popupElements.openControlledTabButton.hidden = true;
  popupElements.pauseTimerButton.hidden = !hasTimer || isPaused;
  popupElements.removeTimerButton.hidden = !hasTimer;
  popupElements.resumeTimerButton.hidden = !hasTimer || !isPaused;
  popupElements.stopTimerButton.disabled = !hasTimer;
};

const updateTimerOverview = (timerSettings) => {
  if (!timerSettings?.enabled) {
    popupElements.timerOverview.dataset.state = "empty";
    popupElements.controlledTabTitle.textContent = "Atualização desligada";
    popupElements.controlledTabUrl.textContent = "Escolha um tempo para começar.";
    popupElements.popupCountdown.textContent = "--:--";
    updateTimerActionButtons(timerSettings);
    return;
  }

  const timerVisualState = getTimerVisualState(timerSettings);

  popupElements.timerOverview.dataset.state = timerVisualState.state;
  popupElements.controlledTabTitle.textContent = getTimerTabLabel(timerSettings);
  popupElements.controlledTabUrl.textContent = timerSettings.tabUrl
    || timerSettings.mainOrigin
    || "Página não identificada";
  popupElements.popupCountdown.textContent = timerVisualState.countdownText;

  updateTimerActionButtons(timerSettings);
};

const createActiveTimerItem = (timerSettings, activeTab) => {
  const item = document.createElement("article");
  const copy = document.createElement("div");
  const title = document.createElement("strong");
  const url = document.createElement("span");
  const meta = document.createElement("div");
  const countdown = document.createElement("span");
  const openButton = document.createElement("button");
  const timerVisualState = getTimerVisualState(timerSettings);
  const isCurrentTab = activeTab?.id === timerSettings.tabId;

  item.className = "active-timers__item";
  item.dataset.state = timerVisualState.state;
  copy.className = "active-timers__copy";
  title.className = "active-timers__title";
  url.className = "active-timers__url";
  meta.className = "active-timers__meta";
  countdown.className = "active-timers__countdown";
  openButton.className = "popup__button popup__button--ghost active-timers__button";
  openButton.type = "button";

  title.textContent = getTimerTabLabel(timerSettings);
  url.textContent = timerSettings.tabUrl
    || timerSettings.mainOrigin
    || "Página não identificada";
  countdown.textContent = timerVisualState.countdownText;
  openButton.textContent = isCurrentTab ? "Atual" : "Abrir";
  openButton.disabled = isCurrentTab;
  openButton.dataset.openTimerTab = String(timerSettings.tabId);

  copy.append(title, url);
  meta.append(countdown, openButton);
  item.append(copy, meta);

  return item;
};

const updateActiveTimersList = (activeTimers, activeTab) => {
  const hasCurrentTabTimer = activeTimers.some((timerSettings) => (
    timerSettings.tabId === activeTab?.id
  ));
  const shouldShowActiveTimers = activeTimers.length > 0
    && (!hasCurrentTabTimer || activeTimers.length > 1);

  popupElements.activeTimersList.innerHTML = "";
  popupElements.activeTimersSection.hidden = !shouldShowActiveTimers;
  popupElements.activeTimersCount.textContent = String(activeTimers.length);

  if (!shouldShowActiveTimers) {
    return;
  }

  activeTimers.forEach((timerSettings) => {
    popupElements.activeTimersList.append(
      createActiveTimerItem(timerSettings, activeTab)
    );
  });
};

const refreshTimerState = async ({ updateStatus = false } = {}) => {
  const activeTab = await getActiveTab();

  currentActiveTab = activeTab || null;

  const response = await getTimerState(activeTab?.id);
  const timerSettings = response.timerSettings;
  const activeTimers = response.activeTimers || [];

  updateTimerOverview(timerSettings);
  updateActiveTimersList(activeTimers, activeTab);

  if (!updateStatus) {
    return timerSettings;
  }

  if (!timerSettings?.enabled) {
    if (activeTimers.length > 0) {
      updateStatusMessage(
        `${formatActiveTimerCount(activeTimers.length)} atualizando. `
          + "Esta página ainda está desligada.",
        "active"
      );
      return timerSettings;
    }

    updateStatusMessage("Nenhuma página atualizando sozinha agora.", "neutral");
    return timerSettings;
  }

  const timerIntervalText = formatTimerInterval(timerSettings.intervalInMinutes);

  if (timerSettings.paused) {
    if (timerSettings.pauseReason === pauseReasons.typing) {
      updateStatusMessage(
        "Você está digitando. A atualização pausou para proteger seu trabalho.",
        "warning"
      );
      return timerSettings;
    }

    if (timerSettings.pauseReason === pauseReasons.media) {
      updateStatusMessage(
        "Áudio, vídeo ou gravação em uso. A atualização pausou para evitar perda.",
        "warning"
      );
      return timerSettings;
    }

    updateStatusMessage("Atualização pausada.", "warning");
    return timerSettings;
  }

  updateStatusMessage(
    `Atualização ligada nesta página: a cada ${timerIntervalText}.`,
    "active"
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
    updateStatusMessage("Preparando atualização automática...", "working");

    const activeTab = currentActiveTab;

    if (typeof activeTab?.id !== "number") {
      updateStatusMessage(
        "Aguarde esta página aparecer no painel e tente de novo.",
        "error"
      );
      return;
    }

    const origin = getUrlOrigin(activeTab.url);

    if (!origin) {
      updateStatusMessage(unsupportedPageMessage, "error");
      return;
    }

    const hasPermission = await requestTimerPermission(origin);

    if (!hasPermission) {
      updateStatusMessage(
        "Você precisa autorizar este site para ligar a atualização.",
        "error"
      );
      return;
    }

    const intervalInMinutes = getSelectedTimerInterval();
    const loadedOrigins = await collectLoadedOrigins(activeTab.id, [origin]);

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
      `Atualização ligada: a cada ${formatTimerInterval(intervalInMinutes)}.`,
      "active"
    );
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao ativar timer:", error);
    updateStatusMessage(
      error.message || "Não consegui ligar a atualização automática agora.",
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

const getActiveTabIdForTimerAction = async () => {
  const activeTab = await getActiveTab();

  if (typeof activeTab?.id !== "number") {
    throw new Error("Não consegui identificar a página aberta.");
  }

  return activeTab.id;
};

const stopTimer = async () => {
  try {
    const tabId = await getActiveTabIdForTimerAction();

    await sendRuntimeMessage({
      payload: {
        tabId
      },
      type: runtimeMessageTypes.stopTimer
    });

    await refreshTimerState();
    updateStatusMessage("Atualização automática desligada.", "warning");
  } catch (error) {
    console.error("Erro ao parar timer:", error);
    updateStatusMessage("Não consegui desligar agora.", "error");
  }
};

const pauseTimer = async () => {
  try {
    const tabId = await getActiveTabIdForTimerAction();

    await sendRuntimeMessage({
      payload: {
        tabId
      },
      type: runtimeMessageTypes.pauseTimer
    });

    updateStatusMessage("Atualização pausada.", "warning");
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao pausar timer:", error);
    updateStatusMessage("Não consegui pausar agora.", "error");
  }
};

const resumeTimer = async () => {
  try {
    const tabId = await getActiveTabIdForTimerAction();

    await sendRuntimeMessage({
      payload: {
        tabId
      },
      type: runtimeMessageTypes.resumeTimer
    });

    updateStatusMessage("Atualização retomada.", "active");
    await refreshTimerState();
  } catch (error) {
    console.error("Erro ao retomar timer:", error);
    updateStatusMessage("Não consegui retomar agora.", "error");
  }
};

const openControlledTab = async (tabId) => {
  try {
    await sendRuntimeMessage({
      payload: {
        tabId
      },
      type: runtimeMessageTypes.openTimerTab
    });
  } catch (error) {
    console.error("Erro ao abrir página controlada:", error);
    updateStatusMessage("Não consegui abrir essa página.", "error");
  }
};

const openOptionsPage = () => {
  chrome.runtime.openOptionsPage();
};

const handleActiveTimersListClick = (event) => {
  const openButton = event.target.closest("[data-open-timer-tab]");

  if (!openButton || openButton.disabled) {
    return;
  }

  openControlledTab(Number(openButton.dataset.openTimerTab));
};

popupElements.reloadPageButton.addEventListener("click", clearCacheAndReloadCurrentPage);
popupElements.openOptionsButton.addEventListener("click", openOptionsPage);
popupElements.pauseTimerButton.addEventListener("click", pauseTimer);
popupElements.removeTimerButton.addEventListener("click", stopTimer);
popupElements.resumeTimerButton.addEventListener("click", resumeTimer);
popupElements.startTimerButton.addEventListener("click", startTimer);
popupElements.stopTimerButton.addEventListener("click", stopTimer);
popupElements.activeTimersList.addEventListener("click", handleActiveTimersListClick);
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
