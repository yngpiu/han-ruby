chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ enabledSites: [] }, () => {})
})
