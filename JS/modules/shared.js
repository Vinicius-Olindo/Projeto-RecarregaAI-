// RecarregaAi! V.1.5.1

export const oneSecondInMilliseconds = 1000;

export const storageKeys = Object.freeze({
  appSettings: "recarregaAiSettings",
  lastTimerRun: "recarregaAiLastTimerRun",
  theme: "recarregaAiTheme",
  timerSettingsPrefix: "recarregaAiTimer:",
  timerSettings: "recarregaAiTimerSettings"
});

export const alarmNames = Object.freeze({
  badgeCountdown: "recarregaAiBadgeCountdown",
  legacyTimer: "recarregaAiAutomaticReload",
  timerPrefix: "recarregaAiAutomaticReload:"
});

export const runtimeMessageTypes = Object.freeze({
  getTimerState: "RECARREGA_AI_GET_TIMER_STATE",
  openTimerTab: "RECARREGA_AI_OPEN_TIMER_TAB",
  pauseTimer: "RECARREGA_AI_PAUSE_TIMER",
  resumeTimer: "RECARREGA_AI_RESUME_TIMER",
  startTimer: "RECARREGA_AI_START_TIMER",
  stopTimer: "RECARREGA_AI_STOP_TIMER",
  typingState: "RECARREGA_AI_TYPING_STATE"
});

export const pauseReasons = Object.freeze({
  manual: "manual",
  navigation: "navigation",
  typing: "typing"
});

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
