chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install") {
    return;
  }

  chrome.storage.local.set({
    recarregaAiInstalledAt: new Date().toISOString()
  });
});
