const input = document.getElementById('input')
const output = document.getElementById('output')

;(async () => {
  const mod = await import(chrome.runtime.getURL('lib/pinyin-pro.mjs'))
  const pinyin = mod.pinyin

  input.addEventListener('input', () => {
    const text = input.value
    if (!text) {
      output.innerHTML = '<span class="empty-msg">Pinyin sẽ hiện ở đây</span>'
      return
    }
    const result = pinyin(text, { type: 'array' })
    output.textContent = result.join(' ')
  })
})()
