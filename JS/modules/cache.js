// RecarregaAi! 2.1.6

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
