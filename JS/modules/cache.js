// RecarregaAi! V.1.5.3

import { cacheDataTypes } from "./shared.js";

export const clearCacheForOrigins = async (origins) => {
  await chrome.browsingData.remove(
    {
      origins
    },
    cacheDataTypes
  );
};

export const reloadTabIgnoringCache = async (tabId) => {
  await chrome.tabs.reload(tabId, {
    bypassCache: true
  });
};
