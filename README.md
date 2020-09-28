# Simply Synonyms

A simple thesaurus extension for Chrome - double click a word to find synonyms, antonyms, and other useful information, without any extra annoying features.

[Get Simply Synonyms for Chrome](https://chrome.google.com/webstore/detail/simply-synonyms/hapeijdlgbbhjmijhmgggnakcgdcpfap)

In order to keep this extension as small and simple as possible, it just uses a content script that injects the popup and double-click listener into every page. The node.js API processes data from the Dictionary API for the extension to fetch.

Powered by the [Merriam-Webster dictionary API](https://dictionaryapi.com/)

[Feature roadmap](https://share.clickup.com/l/h/6-35841888-1/d7129f9d437b7e0)

### Building

The extension doesn't use Webpack or hot reloading or anything similar, so you can simply load `simply-synonyms/simply-synonyms` from the chrome://extensions page.

### API

The API is powered by Node.js and the dictionary API, and hosted on Vercel Serverless Functions.