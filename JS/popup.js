const popupElements = {
  reloadPageButton: document.querySelector("#reload-page-button"),
  statusMessage: document.querySelector("#status-message")
};

const updateStatusMessage = (message) => {
  popupElements.statusMessage.textContent = message;
};

const getActiveTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return activeTab;
};

const reloadCurrentPage = async () => {
  try {
    const activeTab = await getActiveTab();

    if (!activeTab?.id) {
      updateStatusMessage("Nao foi possivel encontrar a aba atual.");
      return;
    }

    await chrome.tabs.reload(activeTab.id);
    updateStatusMessage("Pagina recarregada com sucesso.");
  } catch (error) {
    console.error("Erro ao recarregar a pagina:", error);
    updateStatusMessage("Nao foi possivel recarregar a pagina agora.");
  }
};

popupElements.reloadPageButton.addEventListener("click", reloadCurrentPage);
