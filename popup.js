const toggle = document.getElementById('toggle')
const urlEl = document.getElementById('url')
const statusEl = document.getElementById('status')

async function getHost() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const u = new URL(tab.url)
  urlEl.textContent = u.hostname
  return u.hostname
}

async function isDisabled(host) {
  const { disabledSites } = await chrome.storage.local.get({ disabledSites: [] })
  return disabledSites.includes(host)
}

function setStatus(on) {
  statusEl.textContent = on ? 'Đang bật cho trang này' : 'Đã tắt cho trang này'
}

;(async () => {
  const host = await getHost()
  const off = await isDisabled(host)
  toggle.checked = !off
  setStatus(!off)

  toggle.addEventListener('change', async () => {
    const { disabledSites } = await chrome.storage.local.get({ disabledSites: [] })
    const on = toggle.checked
    setStatus(on)

    if (on) {
      const i = disabledSites.indexOf(host)
      if (i > -1) disabledSites.splice(i, 1)
    } else {
      if (!disabledSites.includes(host)) disabledSites.push(host)
    }
    await chrome.storage.local.set({ disabledSites })

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: on }).catch(() => {})
  })
})()
