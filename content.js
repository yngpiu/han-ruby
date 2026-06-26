const CJK = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SVG', 'NOSCRIPT', 'RT', 'RUBY'])

let pinyin = null
let observer = null
let active = false

async function load() {
  if (pinyin) return
  const mod = await import(chrome.runtime.getURL('lib/pinyin-pro.mjs'))
  pinyin = mod.pinyin
}

function rubySeq(han) {
  const py = pinyin(han, { type: 'array' })
  const frag = document.createDocumentFragment()
  for (let i = 0; i < han.length; i++) {
    const r = document.createElement('ruby')
    r.setAttribute('data-pinyin-done', '')
    r.textContent = han[i]
    const rt = document.createElement('rt')
    rt.textContent = py[i] || ''
    rt.style.userSelect = 'none'
    r.appendChild(rt)
    frag.appendChild(r)
  }
  return frag
}

function walk(root) {
  if (!root || SKIP.has(root.tagName)) return

  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentNode
      if (!p || p.nodeType !== Node.ELEMENT_NODE) return NodeFilter.FILTER_REJECT
      if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT
      if (p.closest('[data-pinyin-done],ruby,rt')) return NodeFilter.FILTER_REJECT
      if (!CJK.test(n.textContent)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const nodes = []
  let n
  while (n = w.nextNode()) nodes.push(n)

  for (const tn of nodes) {
    const parent = tn.parentNode
    if (!parent || parent.nodeType !== Node.ELEMENT_NODE) continue
    if (parent.closest('script,style,textarea,input,option,svg,noscript,pre,code')) continue

    const text = tn.textContent
    const frag = document.createDocumentFragment()
    let buf = ''

    for (const ch of text) {
      if (CJK.test(ch)) { buf += ch }
      else {
        if (buf) { frag.appendChild(rubySeq(buf)); buf = '' }
        frag.appendChild(document.createTextNode(ch))
      }
    }
    if (buf) frag.appendChild(rubySeq(buf))
    parent.replaceChild(frag, tn)
  }
}

function revert() {
  document.querySelectorAll('[data-pinyin-done]').forEach(el => {
    const tn = document.createTextNode(el.childNodes[0].textContent)
    el.parentNode.replaceChild(tn, el)
  })
}

function start() {
  if (active) return
  active = true
  load().then(() => {
    walk(document.body)
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) walk(node)
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

function stop() {
  active = false
  if (observer) { observer.disconnect(); observer = null }
  revert()
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'toggle') {
    msg.enabled ? start() : stop()
  }
})

;(async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true })
  if (enabled) start()
})()
