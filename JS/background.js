// RecarregaAi! 1.8.6

import { appConfig } from "./modules/config.js";
import {
  clearCacheForOrigins,
  reloadTabIgnoringCache
} from "./modules/cache.js";
import {
  alarmNames,
  defaultAppSettings,
  formatCountdownTime,
  getBadgeColor,
  getBadgeText,
  getNextRunDate,
  getNextRunDateFromSeconds,
  getPermissionPatternForOrigin,
  getRemainingSeconds,
  getTabIdFromTimerAlarmName,
  getTimerAlarmName,
  getUrlOrigin,
  normalizeOrigins,
  oneSecondInMilliseconds,
  pauseReasons,
  runtimeMessageTypes
} from "./modules/shared.js";
import {
  getAllTimerSettings,
  getAllTimerSettingsFromCollection,
  getAppSettings,
  getLastTimerRun,
  getStoredTimerCollection,
  getTimerSettingsByTabId,
  getTimerSettingsFromCollection,
  removeTimerSettingsByTabId,
  saveLastTimerRun,
  saveTimerCollection,
  updateTimerSettingsByTabId,
  upsertTimerSettings
} from "./modules/storage.js";
import { collectLoadedOrigins } from "./modules/tabs.js";

let badgeCountdownTimerId = null;
const scheduledRefreshTabIds = new Set();
const automaticPauseReasons = new Set([
  pauseReasons.media,
  pauseReasons.typing
]);

const configureUninstallFeedbackPage = async () => {
  try {
    await chrome.runtime.setUninstallURL(appConfig.uninstallFeedbackPageUrl);
  } catch (error) {
    console.warn("Nao foi possivel configurar feedback de desinstalacao:", error);
  }
};

const hasEditableFocusInFrame = () => {
  const editableInputTypes = new Set([
    "email",
    "number",
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

const hasActiveMediaInFrame = () => {
  return Array.from(document.querySelectorAll("audio, video")).some((element) => (
    !element.paused && !element.ended && element.readyState > 0
  ));
};

const isTabUsingMedia = async (tabId) => {
  if (typeof tabId !== "number") {
    return false;
  }

  try {
    const tab = await chrome.tabs.get(tabId);

    if (tab?.audible) {
      return true;
    }

    const frameResults = await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      func: hasActiveMediaInFrame
    });

    return frameResults.some((frameResult) => Boolean(frameResult.result));
  } catch (error) {
    console.warn("Nao foi possivel verificar midia ativa na guia:", error);
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
    console.warn("Nao foi possivel ativar protecoes da pagina:", error);
  }

  try {
    await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      files: ["JS/page-media-guard.js"],
      world: "MAIN"
    });
  } catch (error) {
    console.warn("Nao foi possivel ativar protecao de midia:", error);
  }
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
  const isPausedByMedia = timerSettings.pauseReason === pauseReasons.media;
  const isPausedByTyping = timerSettings.pauseReason === pauseReasons.typing;
  const remainingSeconds = getRemainingSeconds(timerSettings.nextRunAt);
  let badgeColor = getBadgeColor(timerSettings.nextRunAt);
  let badgeText = getBadgeText(timerSettings.nextRunAt);
  let countdownTime = formatCountdownTime(remainingSeconds);

  if (isPaused) {
    badgeColor = "#667085";
    badgeText = "II";
    countdownTime = "pausado";

    if (isPausedByTyping) {
      badgeColor = "#ef7a1f";
      badgeText = "DIG";
      countdownTime = "digitando";
    }

    if (isPausedByMedia) {
      badgeColor = "#1f7aef";
      badgeText = "AUD";
      countdownTime = "midia ativa";
    }
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

const clearChromeAlarm = async (alarmName) => {
  try {
    return await chrome.alarms.clear(alarmName);
  } catch (error) {
    console.warn(`Nao foi possivel limpar o alarme ${alarmName}:`, error);
    throw error;
  }
};

const createChromeAlarm = async (alarmName, alarmInfo) => {
  try {
    await chrome.alarms.create(alarmName, alarmInfo);

    const createdAlarm = await chrome.alarms.get(alarmName);

    if (!createdAlarm) {
      throw new Error(`Alarme ${alarmName} nao encontrado apos criacao.`);
    }

    return createdAlarm;
  } catch (error) {
    console.error(`Nao foi possivel criar o alarme ${alarmName}:`, error);
    throw error;
  }
};

const clearTimerAlarm = async (tabId) => {
  await clearChromeAlarm(getTimerAlarmName(tabId));
};

const createTimerAlarm = async (
  timerSettings,
  delayInMinutes = timerSettings.intervalInMinutes
) => {
  const alarmName = getTimerAlarmName(timerSettings.tabId);

  await clearChromeAlarm(alarmName);
  await createChromeAlarm(alarmName, {
    delayInMinutes: Math.max(0.5, delayInMinutes),
    periodInMinutes: timerSettings.intervalInMinutes
  });
};

const createBadgeCountdownAlarm = async () => {
  await clearChromeAlarm(alarmNames.badgeCountdown);

  await createChromeAlarm(alarmNames.badgeCountdown, {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
  });
};

const refreshPausedMediaTimers = async (timerSettingsList) => (
  Promise.all(timerSettingsList.map(async (timerSettings) => {
    if (timerSettings.pauseReason !== pauseReasons.media) {
      return timerSettings;
    }

    if (await isTabUsingMedia(timerSettings.tabId)) {
      return timerSettings;
    }

    if (await isTabEditingText(timerSettings.tabId)) {
      return pauseTimerForTyping(timerSettings);
    }

    return resumeTimer(timerSettings.tabId, {
      expectedPauseReason: pauseReasons.media
    });
  }))
);

const handleBadgeCountdownTick = async () => {
  const timerSettingsList = await getAllTimerSettings();
  const refreshedTimerSettingsList = await refreshPausedMediaTimers(timerSettingsList);

  await updateAllTimerBadges(refreshedTimerSettingsList);
};

const startBadgeCountdown = async () => {
  stopBadgeCountdown();

  const timerSettingsList = await getAllTimerSettings();

  if (timerSettingsList.length === 0) {
    await clearChromeAlarm(alarmNames.badgeCountdown);
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

const pauseTimerForAutomaticReason = async (timerSettings, pauseReason) => {
  if (!timerSettings?.enabled) {
    return timerSettings;
  }

  if (timerSettings.paused) {
    if (
      automaticPauseReasons.has(timerSettings.pauseReason)
      && timerSettings.pauseReason !== pauseReason
    ) {
      const pausedTimerSettings = {
        ...timerSettings,
        pauseReason,
        pausedAt: new Date().toISOString()
      };

      await upsertTimerSettings(pausedTimerSettings);
      await clearTimerAlarm(timerSettings.tabId);
      await updateTimerBadge(pausedTimerSettings);

      return pausedTimerSettings;
    }

    await updateTimerBadge(timerSettings);

    return timerSettings;
  }

  const pausedTimerSettings = {
    ...timerSettings,
    paused: true,
    pausedAt: new Date().toISOString(),
    pauseReason,
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

const pauseTimerForTyping = async (timerSettings) => (
  pauseTimerForAutomaticReason(timerSettings, pauseReasons.typing)
);

const pauseTimerForMedia = async (timerSettings) => (
  pauseTimerForAutomaticReason(timerSettings, pauseReasons.media)
);

const pauseTimerForNavigation = async (timerSettings, tab) => {
  const pausedTimerSettings = {
    ...timerSettings,
    lastError: "Timer pausado porque a aba saiu do dominio original.",
    paused: true,
    pausedAt: new Date().toISOString(),
    pauseReason: pauseReasons.navigation,
    remainingSecondsWhenPaused: Math.max(
      1,
      getRemainingSeconds(timerSettings.nextRunAt)
    ),
    tabTitle: tab.title || timerSettings.tabTitle,
    tabUrl: tab.url || timerSettings.tabUrl,
    windowId: tab.windowId
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
    await clearChromeAlarm(alarmNames.badgeCountdown);
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

const hasAutoStartPermission = async (origin) => (
  chrome.permissions.contains({
    origins: [getPermissionPatternForOrigin(origin)]
  })
);

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
  const hasPermission = await hasAutoStartPermission(mainOrigin);

  if (!hasPermission) {
    return;
  }

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

const updateTimerAfterTabLoad = async (tabId, tab, timerSettings) => {
  const tabOrigin = getUrlOrigin(tab.url);

  if (tabOrigin && tabOrigin !== timerSettings.mainOrigin) {
    return pauseTimerForNavigation(timerSettings, tab);
  }

  return updateTimerSettingsByTabId(tabId, (timerSettings) => ({
    ...timerSettings,
    mainOrigin: timerSettings.mainOrigin,
    origins: normalizeOrigins([timerSettings.mainOrigin]),
    tabTitle: tab.title || timerSettings.tabTitle,
    tabUrl: tab.url || timerSettings.tabUrl,
    windowId: tab.windowId
  }));
};

const handleCompletedTabUpdate = async (tabId, tab) => {
  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (timerSettings?.enabled) {
    const updatedTimerSettings = await updateTimerAfterTabLoad(
      tabId,
      tab,
      timerSettings
    );

    if (updatedTimerSettings?.pauseReason !== pauseReasons.navigation) {
      await injectTypingProtection(tabId);
    }

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

  await saveLastTimerRun(result);
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

  if (!tabOrigin || tabOrigin !== timerSettings.mainOrigin) {
    await pauseTimerForNavigation(timerSettings, tab);
    throw new Error("Timer pausado porque a aba saiu do dominio original.");
  }

  const fallbackOrigins = normalizeOrigins([
    timerSettings.mainOrigin,
    tabOrigin,
    ...(timerSettings.origins || [])
  ]);
  const origins = await collectLoadedOrigins(timerSettings.tabId, fallbackOrigins);

  if (origins.length === 0) {
    throw new Error("Nenhuma origem valida para limpeza de cache.");
  }

  await clearCacheForOrigins(origins);
  await reloadTabIgnoringCache(timerSettings.tabId);

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

    if (
      !timerSettings.nextRunAt
      || getRemainingSeconds(timerSettings.nextRunAt) > 0
    ) {
      await updateTimerBadge(timerSettings);
      return;
    }

    if (await isTabEditingText(timerSettings.tabId)) {
      await pauseTimerForTyping(timerSettings);
      return;
    }

    if (await isTabUsingMedia(timerSettings.tabId)) {
      await pauseTimerForMedia(timerSettings);
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
  await clearChromeAlarm(alarmNames.legacyTimer);

  const timerCollection = await getStoredTimerCollection();
  const timerSettingsList = getAllTimerSettingsFromCollection(timerCollection);

  if (timerSettingsList.length === 0) {
    await clearChromeAlarm(alarmNames.badgeCountdown);
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

  if (await isTabUsingMedia(tabId)) {
    return pauseTimerForMedia(await getTimerSettingsByTabId(tabId));
  }

  return resumeTimer(tabId, {
    expectedPauseReason: pauseReasons.typing
  });
};

const resumeTimerAfterMedia = async (tabId) => {
  if (await isTabUsingMedia(tabId)) {
    return getTimerSettingsByTabId(tabId);
  }

  if (await isTabEditingText(tabId)) {
    return pauseTimerForTyping(await getTimerSettingsByTabId(tabId));
  }

  return resumeTimer(tabId, {
    expectedPauseReason: pauseReasons.media
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

const handleMediaState = async (payload, tabId) => {
  if (typeof tabId !== "number") {
    return null;
  }

  const timerSettings = await getTimerSettingsByTabId(tabId);

  if (!timerSettings?.enabled) {
    return timerSettings;
  }

  if (payload?.isMediaActive) {
    return pauseTimerForMedia(timerSettings);
  }

  if (timerSettings.pauseReason === pauseReasons.media) {
    return resumeTimerAfterMedia(tabId);
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

const createTimerSettingsResponse = (timerSettings) => ({
  ok: true,
  timerSettings
});

const runtimeMessageHandlers = {
  [runtimeMessageTypes.getTimerState]: async (message) => {
    const activeTabId = Number(message?.payload?.activeTabId);

    return getTimerStateResponse(
      Number.isInteger(activeTabId) ? activeTabId : null
    );
  },
  [runtimeMessageTypes.mediaState]: async (message, sender) => {
    const timerSettings = await handleMediaState(
      message.payload,
      sender.tab?.id
    );

    return createTimerSettingsResponse(timerSettings);
  },
  [runtimeMessageTypes.openTimerTab]: async (message, sender) => {
    const timerSettings = await openTimerTab(getMessageTabId(message, sender));

    return createTimerSettingsResponse(timerSettings);
  },
  [runtimeMessageTypes.pauseTimer]: async (message, sender) => {
    const timerSettings = await pauseTimer(getMessageTabId(message, sender));

    return createTimerSettingsResponse(timerSettings);
  },
  [runtimeMessageTypes.resumeTimer]: async (message, sender) => {
    const timerSettings = await resumeTimer(getMessageTabId(message, sender));

    return createTimerSettingsResponse(timerSettings);
  },
  [runtimeMessageTypes.startTimer]: async (message) => {
    const timerSettings = await startTimer(message.payload);

    return createTimerSettingsResponse(timerSettings);
  },
  [runtimeMessageTypes.stopTimer]: async (message, sender) => {
    await stopTimer(getMessageTabId(message, sender));

    return {
      ok: true
    };
  },
  [runtimeMessageTypes.typingState]: async (message, sender) => {
    const timerSettings = await handleTypingState(
      message.payload,
      sender.tab?.id
    );

    return createTimerSettingsResponse(timerSettings);
  }
};

const handleRuntimeMessage = async (message, sender = {}) => {
  const messageHandler = runtimeMessageHandlers[message?.type];

  if (messageHandler) {
    return messageHandler(message, sender);
  }

  return {
    ok: false,
    error: "Mensagem desconhecida."
  };
};

const openWelcomePage = async () => {
  await chrome.tabs.create({
    active: true,
    url: chrome.runtime.getURL(appConfig.welcomePagePath)
  });
};

const bootstrapRecarregaAi = async ({
  markInstalled = false,
  openWelcome = false,
  restoreAlarms = true
} = {}) => {
  await configureUninstallFeedbackPage();

  if (markInstalled) {
    await chrome.storage.local.set({
      recarregaAiInstalledAt: new Date().toISOString()
    });
  }

  if (restoreAlarms) {
    await restoreTimerAlarms();
  }

  if (openWelcome) {
    await clearAllTimerBadges();
    await openWelcomePage();
  }
};

chrome.runtime.onInstalled.addListener((details) => {
  bootstrapRecarregaAi({
    markInstalled: details.reason === "install",
    openWelcome: details.reason === "install",
    restoreAlarms: details.reason !== "install"
  }).catch((error) => {
    console.error("Erro ao instalar/atualizar RecarregaAi:", error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  bootstrapRecarregaAi().catch((error) => {
    console.error("Erro ao iniciar RecarregaAi:", error);
  });
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
  if (alarm.name === alarmNames.badgeCountdown) {
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

bootstrapRecarregaAi().catch((error) => {
  console.error("Erro ao carregar service worker do RecarregaAi:", error);
});
