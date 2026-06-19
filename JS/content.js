// RecarregaAi! 2.0.7

(() => {
  const watcherFlag = "__recarregaAiPageSafetyWatcherLoaded";
  const watcherVersion = 3;
  const mediaMessageType = "RECARREGA_AI_MEDIA_STATE";
  const pageMediaGuardMessageType = "RECARREGA_AI_PAGE_MEDIA_STATE";
  const pageMediaGuardSource = "RECARREGA_AI_PAGE_MEDIA_GUARD_V3";
  const typingMessageType = "RECARREGA_AI_TYPING_STATE";
  const blurCheckDelay = 120;
  const mediaSyncDelay = 120;
  const mediaEvents = [
    "abort",
    "emptied",
    "ended",
    "loadeddata",
    "pause",
    "play",
    "playing",
    "stalled",
    "suspend",
    "waiting"
  ];
  const editableInputTypes = new Set([
    "email",
    "number",
    "search",
    "tel",
    "text",
    "url"
  ]);

  if (window[watcherFlag] === watcherVersion) {
    return;
  }

  if (typeof Element === "undefined" || typeof HTMLElement === "undefined") {
    return;
  }

  window[watcherFlag] = watcherVersion;

  let isTyping = false;
  let isMediaActive = false;
  let activeMediaKind = null;
  let pageMediaKind = null;
  let mediaSyncTimerId = null;
  const observedMediaElements = new WeakSet();

  const isEditableElement = (element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.isContentEditable) {
      return true;
    }

    if (element.tagName === "TEXTAREA") {
      return !element.disabled && !element.readOnly;
    }

    if (element.tagName !== "INPUT") {
      return false;
    }

    return !element.disabled
      && !element.readOnly
      && editableInputTypes.has(element.type);
  };

  const getEditableTarget = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    const editableTarget = target.closest("input, textarea, [contenteditable]");

    return isEditableElement(editableTarget) ? editableTarget : null;
  };

  const isExtensionContextInvalidated = (error) => (
    error?.message?.includes("Extension context invalidated")
  );

  const handleRuntimeMessageResponse = () => {
    try {
      if (chrome.runtime.lastError) {
        return;
      }
    } catch (error) {
      if (isExtensionContextInvalidated(error)) {
        return;
      }

      console.debug("RecarregaAi! ignorou resposta de contexto indisponivel:", error);
    }
  };

  const sendRuntimeMessage = (type, payload) => {
    try {
      if (typeof chrome === "undefined" || !chrome.runtime?.id) {
        return;
      }

      chrome.runtime.sendMessage({
        payload,
        type
      }, handleRuntimeMessageResponse);
    } catch (error) {
      if (isExtensionContextInvalidated(error)) {
        return;
      }

      console.debug("RecarregaAi! nao conseguiu enviar estado local:", error);
    }
  };

  const sendTypingState = (nextIsTyping, { force = false } = {}) => {
    if (!force && isTyping === nextIsTyping) {
      return;
    }

    isTyping = nextIsTyping;

    sendRuntimeMessage(typingMessageType, {
      isTyping: nextIsTyping
    });
  };

  const syncCurrentFocus = ({ force = false } = {}) => {
    sendTypingState(Boolean(getEditableTarget(document.activeElement)), {
      force
    });
  };

  const handleEditableActivity = (event) => {
    if (!getEditableTarget(event.target)) {
      return;
    }

    sendTypingState(true);
  };

  const handleFocusOut = () => {
    window.setTimeout(() => {
      syncCurrentFocus();
    }, blurCheckDelay);
  };

  const getActiveMediaElementKind = () => {
    const activeMediaElements = Array.from(
      document.querySelectorAll("audio, video")
    ).filter((element) => (
      !element.paused && !element.ended && element.readyState > 0
    ));

    if (activeMediaElements.some((element) => element.tagName === "VIDEO")) {
      return "video";
    }

    return activeMediaElements.length > 0 ? "audio" : null;
  };

  const getCurrentMediaKind = () => (
    pageMediaKind || getActiveMediaElementKind()
  );

  const sendMediaState = (nextMediaKind, { force = false } = {}) => {
    const nextIsMediaActive = Boolean(nextMediaKind);

    if (
      !force
      && isMediaActive === nextIsMediaActive
      && activeMediaKind === nextMediaKind
    ) {
      return;
    }

    isMediaActive = nextIsMediaActive;
    activeMediaKind = nextMediaKind;

    sendRuntimeMessage(mediaMessageType, {
      isMediaActive: nextIsMediaActive,
      mediaKind: nextMediaKind
    });
  };

  const syncMediaState = ({ force = false } = {}) => {
    sendMediaState(getCurrentMediaKind(), {
      force
    });
  };

  const scheduleMediaSync = () => {
    if (mediaSyncTimerId) {
      window.clearTimeout(mediaSyncTimerId);
    }

    mediaSyncTimerId = window.setTimeout(() => {
      mediaSyncTimerId = null;
      syncMediaState();
    }, mediaSyncDelay);
  };

  const observeMediaElement = (element) => {
    if (observedMediaElements.has(element)) {
      return;
    }

    observedMediaElements.add(element);

    mediaEvents.forEach((eventName) => {
      element.addEventListener(eventName, scheduleMediaSync, true);
    });
  };

  const observeMediaElements = () => {
    document.querySelectorAll("audio, video").forEach(observeMediaElement);
  };

  const handlePageMediaGuardMessage = (event) => {
    if (
      event.source !== window
      || event.data?.source !== pageMediaGuardSource
      || event.data?.type !== pageMediaGuardMessageType
    ) {
      return;
    }

    pageMediaKind = event.data.payload?.isMediaActive
      ? event.data.payload.mediaKind || "recording"
      : null;
    syncMediaState();
  };

  const startMediaObserver = () => {
    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(() => {
      observeMediaElements();
      scheduleMediaSync();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  document.addEventListener("focusin", handleEditableActivity, true);
  document.addEventListener("keydown", handleEditableActivity, true);
  document.addEventListener("input", handleEditableActivity, true);
  document.addEventListener("compositionstart", handleEditableActivity, true);
  document.addEventListener("focusout", handleFocusOut, true);
  document.addEventListener("visibilitychange", scheduleMediaSync, true);
  window.addEventListener("message", handlePageMediaGuardMessage);

  observeMediaElements();
  startMediaObserver();
  syncCurrentFocus({
    force: true
  });
  syncMediaState({
    force: true
  });
})();
