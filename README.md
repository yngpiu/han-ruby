# Han Ruby

A Chrome extension that automatically annotates Chinese text with pinyin using `<ruby>` tags. Includes a built-in real-time Chinese-to-pinyin converter in the popup.

## Features

- **Pinyin ruby** — automatically inserts pinyin above every Chinese character on any webpage
- **Per-site toggle** — click the extension icon → flip the toggle to enable/disable pinyin for the current site (default: off)
- **Converter tool** — type Chinese characters in the popup, pinyin appears in real-time; each box has a copy button

## Install

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `pinyin-extension` folder

## Usage

- Click the extension icon → toggle **Pinyin ruby** to annotate the current page
- The lower section is the converter: type Chinese → get pinyin instantly
- Hover over each box to reveal the copy button

## Build

No build step required — the extension runs directly from source.

## License

MIT
