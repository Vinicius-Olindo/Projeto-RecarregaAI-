(() => {
  const markerId = "recarregaai-extension-marker";

  if (document.getElementById(markerId)) {
    return;
  }

  const marker = document.createElement("meta");

  marker.id = markerId;
  marker.name = "recarregaai-extension";
  marker.content = "active";

  document.head.appendChild(marker);
})();
