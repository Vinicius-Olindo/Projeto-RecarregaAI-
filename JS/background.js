const timerAlarmName = "recarregaAiAutomaticReload";
const badgeCountdownAlarmName = "recarregaAiBadgeCountdown";
const timerSettingsKey = "recarregaAiTimerSettings";
const lastTimerRunKey = "recarregaAiLastTimerRun";
const oneSecondInMilliseconds = 1000;

let badgeCountdownTimerId = null;
let scheduledRefreshInProgress = false;

const runtimeMessageTypes = {
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER"
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

const getNextRunDate = (intervalInMinutes) => (
  new Date(Date.now() + intervalInMinutes * 60 * 1000).toISOString()
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

const clearTimerBadge = async () => {
  stopBadgeCountdown();

  await chrome.action.setBadgeText({
    text: ""
  });
  await chrome.action.setTitle({
    title: "RecarregaAi!"
  });
};

const updateTimerBadge = async (timerSettings) => {
  if (!timerSettings?.enabled || !timerSettings.nextRunAt) {
    await clearTimerBadge();
    return;
  }

  const badgeText = getBadgeText(timerSettings.nextRunAt);
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  const countdownTime = formatCountdownTime(remainingSeconds);

  await chrome.action.setBadgeBackgroundColor({
    color: getBadgeColor(timerSettings.nextRunAt)
  });
  await chrome.action.setBadgeText({
    text: badgeText
  });
  await chrome.action.setTitle({
    title: `RecarregaAi! - proximo reload em ${countdownTime}`
  });
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
    await clearTimerBadge();
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

const createTimerAlarm = async (intervalInMinutes) => {
  await chrome.alarms.clear(timerAlarmName);

  chrome.alarms.create(timerAlarmName, {
    delayInMinutes: intervalInMinutes,
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
    startedAt: new Date().toISOString(),
    tabId: payload.tabId,
    windowId: payload.windowId
  };

  await chrome.storage.local.set({
    [timerSettingsKey]: timerSettings
  });
  await createTimerAlarm(intervalInMinutes);
  await createBadgeCountdownAlarm();
  await startBadgeCountdown(timerSettings);

  return timerSettings;
};

const stopTimer = async () => {
  await chrome.alarms.clear(timerAlarmName);
  await chrome.alarms.clear(badgeCountdownAlarmName);
  stopBadgeCountdown();
  await chrome.storage.local.set({
    [timerSettingsKey]: {
      enabled: false,
      stoppedAt: new Date().toISOString()
    }
  });
  await clearTimerBadge();
};

const saveTimerRunResult = async (timerSettings, result) => {
  const updatedTimerSettings = {
    ...timerSettings,
    lastError: result.error || null,
    lastRunAt: result.finishedAt,
    lastRunStatus: result.status,
    nextRunAt: timerSettings.enabled
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

    if (!timerSettings?.enabled) {
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
    await clearTimerBadge();
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

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install") {
    restoreTimerAlarm();
    return;
  }

  clearTimerBadge();
  chrome.storage.local.set({
    recarregaAiInstalledAt: new Date().toISOString()
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
