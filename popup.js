const toggle = document.getElementById('toggle')
const urlEl = document.getElementById('url')
const statusEl = document.getElementById('status')
const hanInput = document.getElementById('hanInput')
const pinyinOutput = document.getElementById('pinyinOutput')

async function getHost() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tabs[0]?.url) return ''
  try {
    return new URL(tabs[0].url).hostname
  } catch {
    return ''
  }
}

async function isEnabled(host) {
  if (!host) return false
  const { enabledSites } = await chrome.storage.sync.get({ enabledSites: [] })
  return enabledSites.includes(host)
}

function setStatus(on) {
  statusEl.textContent = on ? 'Đang bật' : 'Đã tắt'
}

;(async () => {
  const mod = await import(chrome.runtime.getURL('lib/pinyin-pro.mjs'))
  const pinyin = mod.pinyin

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const el = document.getElementById(btn.dataset.target)
      const text = el.innerText || el.textContent
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        btn.classList.add('copied')
        setTimeout(() => btn.classList.remove('copied'), 1200)
      } catch {}
    })
  })

  hanInput.addEventListener('input', () => {
    const text = hanInput.innerText
    pinyinOutput.textContent = text ? pinyin(text, { type: 'array' }).join(' ') : ''
  })

  const host = await getHost()
  if (!host) {
    urlEl.textContent = 'Trang không hỗ trợ'
    toggle.disabled = true
    return
  }
  urlEl.textContent = host
  const on = await isEnabled(host)
  toggle.checked = on
  setStatus(on)

  toggle.addEventListener('change', async () => {
    const { enabledSites } = await chrome.storage.sync.get({ enabledSites: [] })
    const on = toggle.checked
    setStatus(on)

    if (on) {
      if (!enabledSites.includes(host)) enabledSites.push(host)
    } else {
      const i = enabledSites.indexOf(host)
      if (i > -1) enabledSites.splice(i, 1)
    }
    await chrome.storage.sync.set({ enabledSites })

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled: on }).catch(() => {})
    }
  })
})()
