chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true })
  updateIcon(true)
})

chrome.action.onClicked.addListener(async (tab) => {
  const { enabled } = await chrome.storage.local.get({ enabled: true })
  const newState = !enabled
  await chrome.storage.local.set({ enabled: newState })
  updateIcon(newState)
  chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: newState }).catch(() => {})
})

function updateIcon(on) {
  const path = on ? {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png'
  } : {
    16: 'icons/icon-off-16.png',
    48: 'icons/icon-off-48.png',
    128: 'icons/icon-off-128.png'
  }
  chrome.action.setIcon({ path })
}
