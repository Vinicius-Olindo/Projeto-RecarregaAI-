// RecarregaAi! 2.1.6

export const oneSecondInMilliseconds = 1000;
export const mediaResumeSafetySeconds = 3;

export const storageKeys = Object.freeze({
  actionHistory: "recarregaAiActionHistory",
  appSettings: "recarregaAiSettings",
  lastTimerRun: "recarregaAiLastTimerRun",
  theme: "recarregaAiTheme",
  timerSettingsPrefix: "recarregaAiTimer:",
  timerSettings: "recarregaAiTimerSettings"
});

export const actionHistoryTypes = Object.freeze({
  automaticRefresh: "automatic-refresh",
  manualCleanup: "manual-cleanup",
  timerPaused: "timer-paused",
  timerResumed: "timer-resumed",
  timerStarted: "timer-started",
  timerStopped: "timer-stopped"
});

export const actionHistoryStatuses = Object.freeze({
  error: "error",
  info: "info",
  success: "success",
  warning: "warning"
});

export const alarmNames = Object.freeze({
  badgeCountdown: "recarregaAiBadgeCountdown",
  legacyTimer: "recarregaAiAutomaticReload",
  timerPrefix: "recarregaAiAutomaticReload:"
});

export const runtimeMessageTypes = Object.freeze({
  clearActionHistory: "RECARREGA_AI_CLEAR_ACTION_HISTORY",
  getActionHistory: "RECARREGA_AI_GET_ACTION_HISTORY",
  getTimerState: "RECARREGA_AI_GET_TIMER_STATE",
  openTimerTab: "RECARREGA_AI_OPEN_TIMER_TAB",
  pauseTimer: "RECARREGA_AI_PAUSE_TIMER",
  resumeTimer: "RECARREGA_AI_RESUME_TIMER",
  mediaState: "RECARREGA_AI_MEDIA_STATE",
  recordManualCleanup: "RECARREGA_AI_RECORD_MANUAL_CLEANUP",
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER",
  typingState: "RECARREGA_AI_TYPING_STATE"
});

export const pauseReasons = Object.freeze({
  manual: "manual",
  media: "media",
  navigation: "navigation",
  typing: "typing"
});

export const mediaKinds = Object.freeze({
  audio: "audio",
  generic: "media",
  recording: "recording",
  video: "video"
});

const supportedMediaKinds = new Set(Object.values(mediaKinds));

export const normalizeMediaKind = (mediaKind) => (
  supportedMediaKinds.has(mediaKind) ? mediaKind : mediaKinds.generic
);

export const themeModes = Object.freeze({
  dark: "dark",
  light: "light"
});

export const defaultAppSettings = Object.freeze({
  autoStartSites: [],
  defaultIntervalInMinutes: 3
});

export const cacheDataTypes = Object.freeze({
  cache: true,
  cacheStorage: true,
  serviceWorkers: true
});

export const editableInputTypes = Object.freeze([
  "email",
  "number",
  "search",
  "tel",
  "text",
  "url"
]);

export const createEmptyTimerCollection = () => ({
  timers: {},
  version: 2
});

export const getUrlOrigin = (urlValue) => {
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

export const normalizeOrigins = (origins) => Array.from(
  new Set(
    origins
      .map((origin) => getUrlOrigin(origin))
      .filter(Boolean)
  )
);

export const getPermissionPatternForOrigin = (origin) => `${origin}/*`;

export const getNextRunDate = (intervalInMinutes) => (
  new Date(Date.now() + intervalInMinutes * 60 * 1000).toISOString()
);

export const getNextRunDateFromSeconds = (remainingSeconds) => (
  new Date(Date.now() + remainingSeconds * oneSecondInMilliseconds).toISOString()
);

export const getRemainingSeconds = (nextRunAt) => {
  if (!nextRunAt) {
    return 0;
  }

  const remainingMilliseconds = new Date(nextRunAt).getTime() - Date.now();

  if (!Number.isFinite(remainingMilliseconds)) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(remainingMilliseconds / oneSecondInMilliseconds)
  );
};

export const formatCountdownTime = (remainingSeconds) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
};

export const getBadgeText = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds > 5999) {
    return "99+";
  }

  return formatCountdownTime(remainingSeconds);
};

export const getBadgeColor = (nextRunAt) => {
  const remainingSeconds = getRemainingSeconds(nextRunAt);

  if (remainingSeconds <= 10) {
    return "#ef7a1f";
  }

  return "#1f7aef";
};

export const getTimerAlarmName = (tabId) => `${alarmNames.timerPrefix}${tabId}`;

export const getTabIdFromTimerAlarmName = (alarmName) => {
  if (!alarmName.startsWith(alarmNames.timerPrefix)) {
    return null;
  }

  const tabId = Number(alarmName.slice(alarmNames.timerPrefix.length));

  return Number.isInteger(tabId) ? tabId : null;
};

export const normalizeTimerSettings = (timerSettings) => {
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

export const normalizeTimerCollection = (storedSettings) => {
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

export const collectFrameOrigins = () => {
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
