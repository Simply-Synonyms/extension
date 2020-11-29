# Simply Synonyms

A lightweight thesaurus extension for Chrome - double click any word to find synonyms, antonyms, and other useful information. [Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/simply-synonyms/hapeijdlgbbhjmijhmgggnakcgdcpfap).

The extension simply uses a content script that injects the popup and double-click listener into every page. The node.js API processes data from the Dictionary API (and other sources) for the extension to fetch.

Powered by the [Merriam-Webster dictionary API](https://dictionaryapi.com/).

[Feature roadmap](https://share.clickup.com/l/h/6-35841888-1/d7129f9d437b7e0)

## Folders

+ `simply-synonyms` contains the source code for the extension. It uses Webpack and Babel to bundle the content scripts, popup and background script into a single file each and ensure that they are compatible with the latest versions of Chrome.

+ `backend` contains the Firebase functions and firestore config for the Simply Synonyms API.

+ `email-templates` contains [MJML](https://mjml.io/) templates for Simply Synonyms emails. All emails are sent using [Mailgun](https://www.mailgun.com/).

The [website code is here](https://github.com/Simply-Synonyms/website).
