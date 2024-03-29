# Simply Synonyms

> ❗ I am currently in the process of refactoring and redesigning the extension for a v1 release (see branch v1-dev). Until then, this extension will not be updated any more (except when critical bug fixes are needed). If you would like to help test a v1 release candidate when it's ready, please contact me.

A lightweight thesaurus extension for Chrome - double click any word to find synonyms, antonyms, and other useful information. [Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/simply-synonyms/hapeijdlgbbhjmijhmgggnakcgdcpfap).

The extension simply uses a content script that injects the popup and double-click listener into every page. The node.js API processes data from the Dictionary API (and other sources) for the extension to fetch.

Powered by the [Merriam-Webster dictionary API](https://dictionaryapi.com/).

[Feature roadmap](https://share.clickup.com/l/h/6-35841888-1/d7129f9d437b7e0)

## Structure

+ `simply-synonyms` contains the source code for the extension. It uses Webpack and Babel to bundle the content scripts, popup and background script into a single file each and ensure that they are compatible with the latest versions of Chrome.

+ `backend` contains the Firebase functions and firestore config for the Simply Synonyms API.

+ `email-templates` contains [MJML](https://mjml.io/) templates for Simply Synonyms emails. All emails are sent using [Mailgun](https://www.mailgun.com/).

The [website code is here](https://github.com/Simply-Synonyms/website).

### Contributing

Contributions are always welcomed! Please see [CONTRIBUTING.md](/CONTRIBUTING.md) for details.

### Legal

Simply Synonyms is licensed under GPL-3.0 and as such, usage/modifcation/distribution of any files in this extension must be in accordance with [`/LICENSE`](/LICENSE). The extension itself will remain open-source for the foreseeable future (probably forever), and the core API will likely remain open-source as well. 
