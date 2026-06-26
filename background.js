chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ disabledSites: [] }, () => {})
})
