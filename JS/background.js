// RecarregaAi! V.1.2.5

const legacyTimerAlarmName = "recarregaAiAutomaticReload";
const timerAlarmPrefix = "recarregaAiAutomaticReload:";
const badgeCountdownAlarmName = "recarregaAiBadgeCountdown";
const timerSettingsKey = "recarregaAiTimerSettings";
const lastTimerRunKey = "recarregaAiLastTimerRun";
const appSettingsKey = "recarregaAiSettings";
const oneSecondInMilliseconds = 1000;
const welcomePagePath = "welcome.html";
const uninstallFeedbackPageUrl =
  "https://raw.githack.com/Vinicius-Olindo/RecarregaAI-/main/uninstall.html";

let badgeCountdownTimerId = null;
const scheduledRefreshTabIds = new Set();

const runtimeMessageTypes = {
  getTimerState: "RECARREGA_AI_GET_TIMER_STATE",
  openTimerTab: "RECARREGA_AI_OPEN_TIMER_TAB",
  pauseTimer: "RECARREGA_AI_PAUSE_TIMER",
  resumeTimer: "RECARREGA_AI_RESUME_TIMER",
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER",
  typingState: "RECARREGA_AI_TYPING_STATE"
};

const pauseReasons = {
  manual: "manual",
  typing: "typing"
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

const createEmptyTimerCollection = () => ({
  timers: {},
  version: 2
});

const getExtensionVersionLabel = () => {
  const manifest = chrome.runtime.getManifest();

  return manifest.version_name || `V.${manifest.version}`;
};

const getUninstallFeedbackUrl = () => {
  const params = new URLSearchParams({
    source: "uninstall",
    version: getExtensionVersionLabel()
  });

  return `${uninstallFeedbackPageUrl}?${params.toString()}`;
};

const configureUninstallFeedbackPage = async () => {
  try {
    await chrome.runtime.setUninstallURL(getUninstallFeedbackUrl());
  } catch (error) {
    console.warn("Nao foi possivel configurar feedback de desinstalacao:", error);
  }
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

const hasEditableFocusInFrame = () => {
  const editableInputTypes = new Set([
    "email",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "url"
  ]);
  const activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  if (activeElement.isContentEditable) {
    return true;
  }

  if (activeElement.tagName === "TEXTAREA") {
    return !activeElement.disabled && !activeElement.readOnly;
  }

  if (activeElement.tagName !== "INPUT") {
    return false;
  }

  return !activeElement.disabled
    && !activeElement.readOnly
    && editableInputTypes.has(activeElement.type);
};

const isTabEditingText = async (tabId) => {
  if (typeof tabId !== "number") {
    return false;
  }

  try {
    const frameResults = await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      func: hasEditableFocusInFrame
    });

    return frameResults.some((frameResult) => Boolean(frameResult.result));
  } catch (error) {
    console.warn("Nao foi possivel verificar digitacao na guia:", error);
    return false;
  }
};

const injectTypingProtection = async (tabId) => {
  if (typeof tabId !== "number") {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      files: ["JS/content.js"]
    });
  } catch (error) {
    console.warn("Nao foi possivel ativar protecao de digitacao:", error);
  }
};

const normalizeTimerSettings = (timerSettings) => {
  const tabId = Number(timerSettings?.tabId);

  if (!Number.isInteger(tabId) || timerSettings?.enabled === false) {
    return null;
  }

  return {
    ...timerSettings,
    enabled: true,
    paused: Boolean(timerSettings.paused),
    tabId
  };
};

const normalizeTimerCollection = (storedSettings) => {
  const collection = createEmptyTimerCollection();
  const storedTimers = storedSettings?.version === 2
    ? Object.values(storedSettings.timers || {})
    : [storedSettings];

  storedTimers.forEach((timerSettings) => {
    const normalizedTimerSettings = normalizeTimerSettings(timerSettings);

    if (!normalizedTimerSettings) {
      return;
    }

    collection.timers[String(normalizedTimerSettings.tabId)] =
      normalizedTimerSettings;
  });

  return collection;
};

const getStoredTimerCollection = async () => {
  const storedData = await chrome.storage.local.get(timerSettingsKey);

  return normalizeTimerCollection(storedData[timerSettingsKey]);
};

const saveTimerCollection = async (timerCollection) => {
  await chrome.storage.local.set({
    [timerSettingsKey]: timerCollection
  });
};

const getTimerSettingsFromCollection = (timerCollection, tabId) => {
  if (typeof tabId !== "number") {
    return null;
  }

  return timerCollection.timers[String(tabId)] || null;
};

const getAllTimerSettingsFromCollection = (timerCollection) => (
  Object.values(timerCollection.timers)
    .sort((firstTimer, secondTimer) => (
      String(firstTimer.tabTitle || firstTimer.mainOrigin)
        .localeCompare(String(secondTimer.tabTitle || secondTimer.mainOrigin))
    ))
);

const getAllTimerSettings = async () => {
  const timerCollection = await getStoredTimerCollection();

  return getAllTimerSettingsFromCollection(timerCollection);
};

const getTimerSettingsByTabId = async (tabId) => {
  const timerCollection = await getStoredTimerCollection();

  return getTimerSettingsFromCollection(timerCollection, tabId);
};

const upsertTimerSettings = async (timerSettings) => {
  const timerCollection = await getStoredTimerCollection();

  timerCollection.timers[String(timerSettings.tabId)] = timerSettings;

  await saveTimerCollection(timerCollection);

  return timerCollection;
};

const removeTimerSettingsByTabId = async (tabId) => {
  const timerCollection = await getStoredTimerCollection();

  delete timerCollection.timers[String(tabId)];
  await saveTimerCollection(timerCollection);

  return timerCollection;
};

const updateTimerSettingsByTabId = async (tabId, updater) => {
  const timerCollection = await getStoredTimerCollection();
  const timerSettings = getTimerSettingsFromCollection(timerCollection, tabId);

  if (!timerSettings) {
    return null;
  }

  const updatedTimerSettings = updater(timerSettings);

  timerCollection.timers[String(tabId)] = updatedTimerSettings;
  await saveTimerCollection(timerCollection);

  return updatedTimerSettings;
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

const formatCountdownTime = (remainingSeconds) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
};

const getBadgeText = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds > 5999) {
    return "99+";
  }

  return formatCountdownTime(remainingSeconds);
};

const getBadgeColor = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds <= 10) {
    return "#ef7a1f";
  }

  return "#1f7aef";
};

const getTimerAlarmName = (tabId) => `${timerAlarmPrefix}${tabId}`;

const getTabIdFromTimerAlarmName = (alarmName) => {
  if (!alarmName.startsWith(timerAlarmPrefix)) {
    return null;
  }

  const tabId = Number(alarmName.slice(timerAlarmPrefix.length));

  return Number.isInteger(tabId) ? tabId : null;
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
  await clearActionBadge(timerSettings);
};

const clearAllTimerBadges = async (timerSettingsList = []) => {
  stopBadgeCountdown();
  await Promise.all(timerSettingsList.map(clearActionBadge));
  await clearGlobalActionBadge();
};

const updateTimerBadge = async (timerSettings) => {
  if (!timerSettings?.enabled || !timerSettings.nextRunAt) {
    await clearTimerBadge(timerSettings);
    return;
  }

  const badgeTarget = getBadgeTarget(timerSettings);
  const isPaused = Boolean(timerSettings.paused);
  const isPausedByTyping = timerSettings.pauseReason === pauseReasons.typing;
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  let badgeColor = getBadgeColor(timerSettings.nextRunAt);
  let badgeText = getBadgeText(timerSettings.nextRunAt);
  let countdownTime = formatCountdownTime(remainingSeconds);

  if (isPaused) {
    badgeColor = isPausedByTyping ? "#ef7a1f" : "#667085";
    badgeText = isPausedByTyping ? "DIG" : "II";
    countdownTime = isPausedByTyping ? "digitando" : "pausado";
  }

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
        ? `RecarregaAi! - timer ${countdownTime}`
        : `RecarregaAi! - proximo reload em ${countdownTime}`
    });
  } catch (error) {
    console.warn("Nao foi possivel atualizar badge do RecarregaAi:", error);
  }
};

const updateAllTimerBadges = async (timerSettingsList) => {
  await Promise.all(timerSettingsList.map(updateTimerBadge));
};

const clearTimerAlarm = async (tabId) => {
  await chrome.alarms.clear(getTimerAlarmName(tabId));
};

const createTimerAlarm = async (
  timerSettings,
  delayInMinutes = timerSettings.intervalInMinutes
) => {
  await clearTimerAlarm(timerSettings.tabId);

  chrome.alarms.create(getTimerAlarmName(timerSettings.tabId), {
    delayInMinutes: Math.max(0.5, delayInMinutes),
    periodInMinutes: timerSettings.intervalInMinutes
  });
};

const createBadgeCountdownAlarm = async () => {
  await chrome.alarms.clear(badgeCountdownAlarmName);

  chrome.alarms.create(badgeCountdownAlarmName, {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
  });
};

const handleBadgeCountdownTick = async () => {
  const timerSettingsList = await getAllTimerSettings();

  await updateAllTimerBadges(timerSettingsList);

  for (const timerSettings of timerSettingsList) {
    const shouldRunTimer = timerSettings.enabled
      && !timerSettings.paused
      && timerSettings.nextRunAt
      && getRemainingSeconds(timerSettings.nextRunAt) === 0;

    if (shouldRunTimer) {
      await runScheduledRefresh(timerSettings.tabId);
    }
  }
};

const startBadgeCountdown = async () => {
  stopBadgeCountdown();

  const timerSettingsList = await getAllTimerSettings();

  if (timerSettingsList.length === 0) {
    await chrome.alarms.clear(badgeCountdownAlarmName);
    await clearAllTimerBadges();
    return;
  }

  await createBadgeCountdownAlarm();
  await updateAllTimerBadges(timerSettingsList);

  badgeCountdownTimerId = setInterval(() => {
    handleBadgeCountdownTick().catch((error) => {
      console.error("Erro ao atualizar badges do RecarregaAi:", error);
    });
  }, oneSecondInMilliseconds);
};

const startStoredBadgeCountdown = async () => {
  await startBadgeCountdown();
};

const startTimer = async (payload) => {
  const intervalInMinutes = Math.floor(Number(payload.intervalInMinutes));
  const tabId = Number(payload.tabId);

  if (!Number.isFinite(intervalInMinutes) || intervalInMinutes < 1) {
    throw new Error("Intervalo do timer invalido.");
  }

  if (!Number.isInteger(tabId)) {
    throw new Error("Guia invalida para ativar o timer.");
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
    pauseReason: null,
    remainingSecondsWhenPaused: null,
    source: payload.source || "manual",
    startedAt: new Date().toISOString(),
    tabId,
    tabTitle: payload.tabTitle || null,
    tabUrl: payload.tabUrl || null,
    windowId: payload.windowId
  };

  await upsertTimerSettings(timerSettings);
  await injectTypingProtection(timerSettings.tabId);
  await createTimerAlarm(timerSettings);
  await startBadgeCountdown();

  return timerSettings;
};

const pauseTimer = async (tabId) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings?.enabled) {
    throw new Error("Nenhum timer ativo para pausar nesta guia.");
  }

  if (timerSettings.paused) {
    await updateTimerBadge(timerSettings);
    return timerSettings;
  }

  const pausedTimerSettings = {
    ...timerSettings,
    paused: true,
    pausedAt: new Date().toISOString(),
    pauseReason: pauseReasons.manual,
    remainingSecondsWhenPaused: getRemainingSeconds(timerSettings.nextRunAt)
  };

  await upsertTimerSettings(pausedTimerSettings);
  await clearTimerAlarm(tabId);
  await updateTimerBadge(pausedTimerSettings);

  return pausedTimerSettings;
};

const pauseTimerForTyping = async (timerSettings) => {
  if (!timerSettings?.enabled) {
    return timerSettings;
  }

  if (timerSettings.paused) {
    await updateTimerBadge(timerSettings);
    return timerSettings;
  }

  const pausedTimerSettings = {
    ...timerSettings,
    paused: true,
    pausedAt: new Date().toISOString(),
    pauseReason: pauseReasons.typing,
    remainingSecondsWhenPaused: Math.max(
      1,
      getRemainingSeconds(timerSettings.nextRunAt)
    )
  };

  await upsertTimerSettings(pausedTimerSettings);
  await clearTimerAlarm(timerSettings.tabId);
  await updateTimerBadge(pausedTimerSettings);

  return pausedTimerSettings;
};

const resumeTimer = async (tabId, { expectedPauseReason = null } = {}) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings?.enabled) {
    throw new Error("Nenhum timer pausado para retomar nesta guia.");
  }

  if (
    expectedPauseReason
    && timerSettings.pauseReason !== expectedPauseReason
  ) {
    return timerSettings;
  }

  if (!timerSettings.paused) {
    await startBadgeCountdown();
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
    pauseReason: null,
    remainingSecondsWhenPaused: null,
    resumedAt: new Date().toISOString()
  };

  await upsertTimerSettings(resumedTimerSettings);
  await injectTypingProtection(resumedTimerSettings.tabId);
  await createTimerAlarm(resumedTimerSettings, remainingSeconds / 60);
  await startBadgeCountdown();

  return resumedTimerSettings;
};

const stopTimer = async (tabId) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings) {
    return null;
  }

  const timerCollection = await removeTimerSettingsByTabId(tabId);
  const timerSettingsList = getAllTimerSettingsFromCollection(timerCollection);

  await clearTimerAlarm(tabId);
  await clearTimerBadge(timerSettings);

  if (timerSettingsList.length === 0) {
    await chrome.alarms.clear(badgeCountdownAlarmName);
    await clearAllTimerBadges();
    return timerSettings;
  }

  await startBadgeCountdown();

  return timerSettings;
};

const openTimerTab = async (tabId) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings?.enabled || typeof timerSettings.tabId !== "number") {
    throw new Error("Nenhuma guia monitorada para abrir.");
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

  const existingTimerSettings = await getTimerSettingsByTabId(tabId);

  if (existingTimerSettings?.enabled) {
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

const updateTimerAfterTabLoad = async (tabId, tab) => {
  const tabOrigin = getUrlOrigin(tab.url);

  return updateTimerSettingsByTabId(tabId, (timerSettings) => ({
    ...timerSettings,
    mainOrigin: tabOrigin || timerSettings.mainOrigin,
    tabTitle: tab.title || timerSettings.tabTitle,
    tabUrl: tab.url || timerSettings.tabUrl,
    windowId: tab.windowId
  }));
};

const handleCompletedTabUpdate = async (tabId, tab) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (timerSettings?.enabled) {
    await updateTimerAfterTabLoad(tabId, tab);
    await injectTypingProtection(tabId);
    await startBadgeCountdown();
    return;
  }

  await autoStartTimerForTab(tabId, tab);
};

const saveTimerRunResult = async (timerSettings, result) => {
  const latestTimerSettings = await getTimerSettingsByTabId(timerSettings.tabId);

  if (!latestTimerSettings?.enabled) {
    return null;
  }

  const updatedTimerSettings = {
    ...latestTimerSettings,
    lastError: result.error || null,
    lastRunAt: result.finishedAt,
    lastRunStatus: result.status,
    nextRunAt: latestTimerSettings.paused
      ? latestTimerSettings.nextRunAt
      : getNextRunDate(latestTimerSettings.intervalInMinutes),
    origins: result.origins || latestTimerSettings.origins
  };

  await chrome.storage.local.set({
    [lastTimerRunKey]: result
  });
  await upsertTimerSettings(updatedTimerSettings);

  if (!updatedTimerSettings.paused) {
    await createTimerAlarm(updatedTimerSettings);
  }

  await startBadgeCountdown();

  return updatedTimerSettings;
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

const runScheduledRefresh = async (tabId) => {
  if (scheduledRefreshTabIds.has(tabId)) {
    return;
  }

  scheduledRefreshTabIds.add(tabId);
  let timerSettings;

  try {
    timerSettings = await getTimerSettingsByTabId(tabId);

    if (!timerSettings?.enabled || timerSettings.paused) {
      return;
    }

    if (await isTabEditingText(timerSettings.tabId)) {
      await pauseTimerForTyping(timerSettings);
      return;
    }

    try {
      const origins = await clearCacheAndReloadTab(timerSettings);

      await saveTimerRunResult(timerSettings, {
        error: null,
        finishedAt: new Date().toISOString(),
        origins,
        status: "success",
        tabId: timerSettings.tabId
      });
    } catch (error) {
      console.error("Erro no timer do RecarregaAi:", error);

      await saveTimerRunResult(timerSettings, {
        error: error.message,
        finishedAt: new Date().toISOString(),
        origins: timerSettings.origins,
        status: "error",
        tabId: timerSettings.tabId
      });
    }
  } finally {
    scheduledRefreshTabIds.delete(tabId);
  }
};

const restoreTimerAlarms = async () => {
  await chrome.alarms.clear(legacyTimerAlarmName);

  const timerCollection = await getStoredTimerCollection();
  const timerSettingsList = getAllTimerSettingsFromCollection(timerCollection);

  if (timerSettingsList.length === 0) {
    await chrome.alarms.clear(badgeCountdownAlarmName);
    await clearAllTimerBadges();
    return;
  }

  await saveTimerCollection(timerCollection);

  for (const timerSettings of timerSettingsList) {
    await injectTypingProtection(timerSettings.tabId);

    if (timerSettings.paused) {
      await updateTimerBadge(timerSettings);
      continue;
    }

    const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
    const nextRunAt = remainingSeconds > 0
      ? timerSettings.nextRunAt
      : getNextRunDate(timerSettings.intervalInMinutes);
    const restoredTimerSettings = {
      ...timerSettings,
      nextRunAt
    };

    await upsertTimerSettings(restoredTimerSettings);
    await createTimerAlarm(
      restoredTimerSettings,
      Math.max(1, getRemainingSeconds(nextRunAt)) / 60
    );
  }

  await startBadgeCountdown();
};

const resumeTimerAfterTyping = async (tabId) => {
  if (await isTabEditingText(tabId)) {
    return getTimerSettingsByTabId(tabId);
  }

  return resumeTimer(tabId, {
    expectedPauseReason: pauseReasons.typing
  });
};

const handleTypingState = async (payload, tabId) => {
  if (typeof tabId !== "number") {
    return null;
  }

  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings?.enabled) {
    return timerSettings;
  }

  if (payload?.isTyping) {
    return pauseTimerForTyping(timerSettings);
  }

  if (timerSettings.pauseReason === pauseReasons.typing) {
    return resumeTimerAfterTyping(tabId);
  }

  return timerSettings;
};

const getTimerStateResponse = async (activeTabId) => {
  const timerCollection = await getStoredTimerCollection();
  const activeTimers = getAllTimerSettingsFromCollection(timerCollection);
  const timerSettings = getTimerSettingsFromCollection(
    timerCollection,
    activeTabId
  );

  return {
    activeTimerCount: activeTimers.length,
    activeTimers,
    appSettings: await getAppSettings(),
    lastTimerRun: await getLastTimerRun(),
    ok: true,
    timerSettings
  };
};

const getMessageTabId = (message, sender) => {
  const payloadTabId = Number(message?.payload?.tabId);

  if (Number.isInteger(payloadTabId)) {
    return payloadTabId;
  }

  return sender?.tab?.id;
};

const handleRuntimeMessage = async (message, sender = {}) => {
  if (message?.type === runtimeMessageTypes.getTimerState) {
    const activeTabId = Number(message.payload?.activeTabId);

    return getTimerStateResponse(
      Number.isInteger(activeTabId) ? activeTabId : null
    );
  }

  if (message?.type === runtimeMessageTypes.openTimerTab) {
    const timerSettings = await openTimerTab(getMessageTabId(message, sender));

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.pauseTimer) {
    const timerSettings = await pauseTimer(getMessageTabId(message, sender));

    return {
      ok: true,
      timerSettings
    };
  }

  if (message?.type === runtimeMessageTypes.resumeTimer) {
    const timerSettings = await resumeTimer(getMessageTabId(message, sender));

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
    await stopTimer(getMessageTabId(message, sender));

    return {
      ok: true
    };
  }

  if (message?.type === runtimeMessageTypes.typingState) {
    const timerSettings = await handleTypingState(
      message.payload,
      sender.tab?.id
    );

    return {
      ok: true,
      timerSettings
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
  configureUninstallFeedbackPage();

  if (details.reason !== "install") {
    restoreTimerAlarms();
    return;
  }

  clearAllTimerBadges();
  chrome.storage.local.set({
    recarregaAiInstalledAt: new Date().toISOString()
  });
  openWelcomePage().catch((error) => {
    console.error("Erro ao abrir boas-vindas do RecarregaAi:", error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  configureUninstallFeedbackPage();
  restoreTimerAlarms();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleRuntimeMessage(message, sender)
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
      console.error("Erro ao restaurar badges do RecarregaAi:", error);
    });
    return;
  }

  const tabId = getTabIdFromTimerAlarmName(alarm.name);

  if (typeof tabId === "number") {
    runScheduledRefresh(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  stopTimer(tabId).catch((error) => {
    console.error("Erro ao remover timer da guia fechada:", error);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  handleCompletedTabUpdate(tabId, tab).catch((error) => {
    console.error("Erro ao preparar guia atualizada no RecarregaAi:", error);
  });
});

configureUninstallFeedbackPage();
