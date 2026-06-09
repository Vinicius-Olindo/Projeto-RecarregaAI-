const timerAlarmName = "recarregaAiAutomaticReload";
const badgeCountdownAlarmName = "recarregaAiBadgeCountdown";
const timerSettingsKey = "recarregaAiTimerSettings";
const lastTimerRunKey = "recarregaAiLastTimerRun";
const appSettingsKey = "recarregaAiSettings";
const oneSecondInMilliseconds = 1000;
const welcomePagePath = "welcome.html";

let badgeCountdownTimerId = null;
let scheduledRefreshInProgress = false;

const runtimeMessageTypes = {
  getTimerState: "RECARREGA_AI_GET_TIMER_STATE",
  openTimerTab: "RECARREGA_AI_OPEN_TIMER_TAB",
  pauseTimer: "RECARREGA_AI_PAUSE_TIMER",
  resumeTimer: "RECARREGA_AI_RESUME_TIMER",
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER"
};

const defaultAppSettings = {
  autoStartSites: [],
  defaultIntervalInMinutes: 3
};

const cacheDataTypes = {
  cache: true,
  cacheStorage: true,
  serviceWorkers: true
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

const normalizeOrigins = (origins) => Array.from(
  new Set(
    origins
      .map((origin) => getUrlOrigin(origin))
      .filter(Boolean)
  )
);

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

const collectLoadedOrigins = async (tabId, fallbackOrigins) => {
  const origins = new Set(fallbackOrigins);

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
    console.warn("Nao foi possivel atualizar todas as origens do timer:", error);
  }

  return normalizeOrigins(Array.from(origins));
};

const getStoredTimerSettings = async () => {
  const storedData = await chrome.storage.local.get(timerSettingsKey);

  return storedData[timerSettingsKey];
};

const getLastTimerRun = async () => {
  const storedData = await chrome.storage.local.get(lastTimerRunKey);

  return storedData[lastTimerRunKey];
};

const getAppSettings = async () => {
  const storedData = await chrome.storage.local.get(appSettingsKey);
  const storedSettings = storedData[appSettingsKey] || {};

  return {
    ...defaultAppSettings,
    ...storedSettings,
    autoStartSites: Array.isArray(storedSettings.autoStartSites)
      ? storedSettings.autoStartSites
      : []
  };
};

const getNextRunDate = (intervalInMinutes) => (
  new Date(Date.now() + intervalInMinutes * 60 * 1000).toISOString()
);

const getNextRunDateFromSeconds = (remainingSeconds) => (
  new Date(Date.now() + remainingSeconds * oneSecondInMilliseconds).toISOString()
);

const getRemainingSeconds = (nextRunAt) => {
  const remainingMilliseconds = new Date(nextRunAt).getTime() - Date.now();

  return Math.max(
    0,
    Math.ceil(remainingMilliseconds / oneSecondInMilliseconds)
  );
};

const getBadgeText = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds > 5999) {
    return "99+";
  }

  return formatCountdownTime(remainingSeconds);
};

const formatCountdownTime = (remainingSeconds) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
};

const getBadgeColor = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds <= 10) {
    return "#ef7a1f";
  }

  return "#1f7aef";
};

const stopBadgeCountdown = () => {
  if (!badgeCountdownTimerId) {
    return;
  }

  clearInterval(badgeCountdownTimerId);
  badgeCountdownTimerId = null;
};

const getBadgeTarget = (timerSettings) => {
  if (typeof timerSettings?.tabId !== "number") {
    return {};
  }

  return {
    tabId: timerSettings.tabId
  };
};

const clearActionBadge = async (timerSettings) => {
  const badgeTarget = getBadgeTarget(timerSettings);

  try {
    await chrome.action.setBadgeText({
      ...badgeTarget,
      text: ""
    });
    await chrome.action.setTitle({
      ...badgeTarget,
      title: "RecarregaAi!"
    });
  } catch (error) {
    console.warn("Nao foi possivel limpar badge do RecarregaAi:", error);
  }
};

const clearGlobalActionBadge = async () => {
  await clearActionBadge();
};

const clearTimerBadge = async (timerSettings) => {
  stopBadgeCountdown();

  await clearActionBadge(timerSettings);
  await clearGlobalActionBadge();
};

const updateTimerBadge = async (timerSettings) => {
  if (!timerSettings?.enabled || !timerSettings.nextRunAt) {
    await clearTimerBadge(timerSettings);
    return;
  }

  const badgeTarget = getBadgeTarget(timerSettings);
  const isPaused = Boolean(timerSettings.paused);
  const badgeText = isPaused ? "II" : getBadgeText(timerSettings.nextRunAt);
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  const countdownTime = isPaused
    ? "pausado"
    : formatCountdownTime(remainingSeconds);
  const badgeColor = isPaused
    ? "#667085"
    : getBadgeColor(timerSettings.nextRunAt);

  try {
    await chrome.action.setBadgeBackgroundColor({
      ...badgeTarget,
      color: badgeColor
    });
    await chrome.action.setBadgeText({
      ...badgeTarget,
      text: badgeText
    });
    await chrome.action.setTitle({
      ...badgeTarget,
      title: isPaused
        ? "RecarregaAi! - timer pausado"
        : `RecarregaAi! - proximo reload em ${countdownTime}`
    });
  } catch (error) {
    console.warn("Nao foi possivel atualizar badge do RecarregaAi:", error);
  }
};

const updateStoredTimerBadge = async () => {
  const timerSettings = await getStoredTimerSettings();

  await updateTimerBadge(timerSettings);
};

const handleBadgeCountdownTick = async () => {
  const timerSettings = await getStoredTimerSettings();

  await updateTimerBadge(timerSettings);

  if (
    timerSettings?.enabled
    && timerSettings.nextRunAt
    && getRemainingSeconds(timerSettings.nextRunAt) === 0
  ) {
    await runScheduledRefresh();
  }
};

const startBadgeCountdown = async (timerSettings) => {
  stopBadgeCountdown();

  if (!timerSettings?.enabled) {
    await clearTimerBadge(timerSettings);
    return;
  }

  await updateTimerBadge(timerSettings);

  badgeCountdownTimerId = setInterval(() => {
    handleBadgeCountdownTick().catch((error) => {
      console.error("Erro ao atualizar badge do RecarregaAi:", error);
    });
  }, oneSecondInMilliseconds);
};

const startStoredBadgeCountdown = async () => {
  const timerSettings = await getStoredTimerSettings();

  await startBadgeCountdown(timerSettings);
};

const createTimerAlarm = async (
  intervalInMinutes,
  delayInMinutes = intervalInMinutes
) => {
  await chrome.alarms.clear(timerAlarmName);

  chrome.alarms.create(timerAlarmName, {
    delayInMinutes: Math.max(0.5, delayInMinutes),
    periodInMinutes: intervalInMinutes
  });
};

const createBadgeCountdownAlarm = async () => {
  await chrome.alarms.clear(badgeCountdownAlarmName);

  chrome.alarms.create(badgeCountdownAlarmName, {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
  });
};

const startTimer = async (payload) => {
  const previousTimerSettings = await getStoredTimerSettings();
  const intervalInMinutes = Math.floor(Number(payload.intervalInMinutes));

  if (!Number.isFinite(intervalInMinutes) || intervalInMinutes < 1) {
    throw new Error("Intervalo do timer invalido.");
  }

  const origins = normalizeOrigins([
    payload.mainOrigin,
    ...(payload.origins || [])
  ]);

  if (origins.length === 0) {
    throw new Error("Nenhuma origem valida para limpeza de cache.");
  }

  const timerSettings = {
    enabled: true,
    intervalInMinutes,
    lastRunAt: null,
    mainOrigin: origins[0],
    nextRunAt: getNextRunDate(intervalInMinutes),
    origins,
    paused: false,
    pausedAt: null,
    remainingSecondsWhenPaused: null,
    source: payload.source || "manual",
    startedAt: new Date().toISOString(),
    tabId: payload.tabId,
    tabTitle: payload.tabTitle || null,
    tabUrl: payload.tabUrl || null,
    windowId: payload.windowId
  };

  if (
    previousTimerSettings?.enabled
    && previousTimerSettings.tabId !== timerSettings.tabId
  ) {
    await clearActionBadge(previousTimerSettings);
  }

  await clearGlobalActionBadge();
  await chrome.storage.local.set({
    [timerSettingsKey]: timerSettings
  });
  await createTimerAlarm(intervalInMinutes);
  await createBadgeCountdownAlarm();
  await startBadgeCountdown(timerSettings);

  return timerSettings;
};

const pauseTimer = async () => {
  const timerSettings = await getStoredTimerSettings();

  if (!timerSettings?.enabled) {
    throw new Error("Nenhum timer ativo para pausar.");
  }

  if (timerSettings.paused) {
    await updateTimerBadge(timerSettings);
    return timerSettings;
  }

  const pausedTimerSettings = {
    ...timerSettings,
    paused: true,
    pausedAt: new Date().toISOString(),
    remainingSecondsWhenPaused: getRemainingSeconds(timerSettings.nextRunAt)
  };

  await chrome.alarms.clear(timerAlarmName);
  await chrome.alarms.clear(badgeCountdownAlarmName);
  stopBadgeCountdown();
  await chrome.storage.local.set({
    [timerSettingsKey]: pausedTimerSettings
  });
  await updateTimerBadge(pausedTimerSettings);

  return pausedTimerSettings;
};

const resumeTimer = async () => {
  const timerSettings = await getStoredTimerSettings();

  if (!timerSettings?.enabled) {
    throw new Error("Nenhum timer pausado para retomar.");
  }

  if (!timerSettings.paused) {
    await startBadgeCountdown(timerSettings);
    return timerSettings;
  }

  const remainingSeconds = Math.max(
    1,
    Number(timerSettings.remainingSecondsWhenPaused) || 1
  );
  const resumedTimerSettings = {
    ...timerSettings,
    nextRunAt: getNextRunDateFromSeconds(remainingSeconds),
    paused: false,
    pausedAt: null,
    remainingSecondsWhenPaused: null,
    resumedAt: new Date().toISOString()
  };

  await chrome.storage.local.set({
    [timerSettingsKey]: resumedTimerSettings
  });
  await createTimerAlarm(
    resumedTimerSettings.intervalInMinutes,
    remainingSeconds / 60
  );
  await createBadgeCountdownAlarm();
  await startBadgeCountdown(resumedTimerSettings);

  return resumedTimerSettings;
};

const stopTimer = async () => {
  const timerSettings = await getStoredTimerSettings();

  await chrome.alarms.clear(timerAlarmName);
  await chrome.alarms.clear(badgeCountdownAlarmName);
  stopBadgeCountdown();
  await chrome.storage.local.set({
    [timerSettingsKey]: {
      enabled: false,
      paused: false,
      stoppedAt: new Date().toISOString()
    }
  });
  await clearTimerBadge(timerSettings);
};

const openTimerTab = async () => {
  const timerSettings = await getStoredTimerSettings();

  if (!timerSettings?.enabled || typeof timerSettings.tabId !== "number") {
    throw new Error("Nenhuma guia controlada para abrir.");
  }

  if (typeof timerSettings.windowId === "number") {
    await chrome.windows.update(timerSettings.windowId, {
      focused: true
    });
  }

  await chrome.tabs.update(timerSettings.tabId, {
    active: true
  });

  return timerSettings;
};

const getMatchingAutoStartSite = (tabUrl, appSettings) => {
  const tabOrigin = getUrlOrigin(tabUrl);

  if (!tabOrigin) {
    return null;
  }

  return appSettings.autoStartSites.find((site) => (
    site.enabled !== false && site.origin === tabOrigin
  )) || null;
};

const autoStartTimerForTab = async (tabId, tab) => {
  if (!tab?.url) {
    return;
  }

  const appSettings = await getAppSettings();
  const matchingSite = getMatchingAutoStartSite(tab.url, appSettings);

  if (!matchingSite) {
    return;
  }

  const timerSettings = await getStoredTimerSettings();

  if (timerSettings?.enabled) {
    return;
  }

  const mainOrigin = getUrlOrigin(tab.url);
  const intervalInMinutes = matchingSite.intervalInMinutes
    || appSettings.defaultIntervalInMinutes
    || defaultAppSettings.defaultIntervalInMinutes;
  const origins = await collectLoadedOrigins(tabId, [mainOrigin]);

  await startTimer({
    intervalInMinutes,
    mainOrigin,
    origins,
    source: "auto",
    tabId,
    tabTitle: tab.title,
    tabUrl: tab.url,
    windowId: tab.windowId
  });
};

const saveTimerRunResult = async (timerSettings, result) => {
  const updatedTimerSettings = {
    ...timerSettings,
    lastError: result.error || null,
    lastRunAt: result.finishedAt,
    lastRunStatus: result.status,
    nextRunAt: timerSettings.enabled && !timerSettings.paused
      ? getNextRunDate(timerSettings.intervalInMinutes)
      : null,
    origins: result.origins || timerSettings.origins
  };

  await chrome.storage.local.set({
    [lastTimerRunKey]: result,
    [timerSettingsKey]: updatedTimerSettings
  });
  await startBadgeCountdown(updatedTimerSettings);
};

const clearCacheAndReloadTab = async (timerSettings) => {
  const tab = await chrome.tabs.get(timerSettings.tabId);
  const tabOrigin = getUrlOrigin(tab.url);
  const fallbackOrigins = normalizeOrigins([
    timerSettings.mainOrigin,
    tabOrigin,
    ...(timerSettings.origins || [])
  ]);
  const origins = await collectLoadedOrigins(timerSettings.tabId, fallbackOrigins);

  if (origins.length === 0) {
    throw new Error("Nenhuma origem valida para limpeza de cache.");
  }

  await chrome.browsingData.remove(
    {
      origins
    },
    cacheDataTypes
  );
  await chrome.tabs.reload(timerSettings.tabId, {
    bypassCache: true
  });

  return origins;
};

const runScheduledRefresh = async () => {
  if (scheduledRefreshInProgress) {
    return;
  }

  scheduledRefreshInProgress = true;
  let timerSettings;

  try {
    timerSettings = await getStoredTimerSettings();

    if (!timerSettings?.enabled || timerSettings.paused) {
      return;
    }

    try {
      const origins = await clearCacheAndReloadTab(timerSettings);

      await saveTimerRunResult(timerSettings, {
        error: null,
        finishedAt: new Date().toISOString(),
        origins,
        status: "success"
      });
    } catch (error) {
      console.error("Erro no timer do RecarregaAi:", error);

      await saveTimerRunResult(timerSettings, {
        error: error.message,
        finishedAt: new Date().toISOString(),
        origins: timerSettings.origins,
        status: "error"
      });
    }
  } finally {
    scheduledRefreshInProgress = false;
  }
};

const restoreTimerAlarm = async () => {
  const timerSettings = await getStoredTimerSettings();

  if (!timerSettings?.enabled) {
    await clearTimerBadge(timerSettings);
    return;
  }

  if (timerSettings.paused) {
    await updateTimerBadge(timerSettings);
    return;
  }

  const restoredTimerSettings = {
    ...timerSettings,
    nextRunAt: getNextRunDate(timerSettings.intervalInMinutes)
  };

  await chrome.storage.local.set({
    [timerSettingsKey]: restoredTimerSettings
  });
  await createTimerAlarm(timerSettings.intervalInMinutes);
  await createBadgeCountdownAlarm();
  await startBadgeCountdown(restoredTimerSettings);
};

const handleRuntimeMessage = async (message) => {
  if (message?.type === runtimeMessageTypes.getTimerState) {
    return {
      appSettings: await getAppSettings(),
      lastTimerRun: await getLastTimerRun(),
      ok: true,
      timerSettings: await getStoredTimerSettings()
    };
  }

  if (message?.type === runtimeMessageTypes.openTimerTab) {
    const timerSettings = await openTimerTab();

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.pauseTimer) {
    const timerSettings = await pauseTimer();

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.resumeTimer) {
    const timerSettings = await resumeTimer();

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.startTimer) {
    const timerSettings = await startTimer(message.payload);

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.stopTimer) {
    await stopTimer();

    return {
      ok: true
    };
  }

  return {
    ok: false,
    error: "Mensagem desconhecida."
  };
};

const openWelcomePage = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL(welcomePagePath)
  });
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install") {
    restoreTimerAlarm();
    return;
  }

  clearTimerBadge();
  chrome.storage.local.set({
    recarregaAiInstalledAt: new Date().toISOString()
  });
  openWelcomePage().catch((error) => {
    console.error("Erro ao abrir boas-vindas do RecarregaAi:", error);
  });
});

chrome.runtime.onStartup.addListener(restoreTimerAlarm);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleRuntimeMessage(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error.message
      });
    });

  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === badgeCountdownAlarmName) {
    startStoredBadgeCountdown().catch((error) => {
      console.error("Erro ao restaurar badge do RecarregaAi:", error);
    });
    return;
  }

  if (alarm.name === timerAlarmName) {
    runScheduledRefresh();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  getStoredTimerSettings()
    .then((timerSettings) => {
      if (timerSettings?.enabled && timerSettings.tabId === tabId) {
        return stopTimer();
      }

      return null;
    })
    .catch((error) => {
      console.error("Erro ao verificar guia removida no RecarregaAi:", error);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  autoStartTimerForTab(tabId, tab).catch((error) => {
    console.error("Erro ao iniciar timer automatico do RecarregaAi:", error);
  });
});
