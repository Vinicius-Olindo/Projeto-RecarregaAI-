// RecarregaAi! V.1.2.1

(() => {
  const watcherFlag = "__recarregaAiTypingWatcherLoaded";
  const messageType = "RECARREGA_AI_TYPING_STATE";
  const blurCheckDelay = 120;
  const editableInputTypes = new Set([
    "email",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "url"
  ]);

  if (window[watcherFlag]) {
    return;
  }

  if (typeof Element === "undefined" || typeof HTMLElement === "undefined") {
    return;
  }

  window[watcherFlag] = true;

  let isTyping = false;

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

  const sendTypingState = (nextIsTyping, { force = false } = {}) => {
    if (!force && isTyping === nextIsTyping) {
      return;
    }

    isTyping = nextIsTyping;

    chrome.runtime.sendMessage({
      payload: {
        isTyping: nextIsTyping
      },
      type: messageType
    }, () => {
      if (chrome.runtime.lastError) {
        return;
      }
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

  document.addEventListener("focusin", handleEditableActivity, true);
  document.addEventListener("keydown", handleEditableActivity, true);
  document.addEventListener("input", handleEditableActivity, true);
  document.addEventListener("compositionstart", handleEditableActivity, true);
  document.addEventListener("focusout", handleFocusOut, true);

  syncCurrentFocus({
    force: true
  });
})();
