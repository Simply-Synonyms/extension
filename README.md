# Simply Synonyms

A lightweight thesaurus extension for Chrome - double click any word to find synonyms, antonyms, and other useful information. [Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/simply-synonyms/hapeijdlgbbhjmijhmgggnakcgdcpfap).

The extension simply uses a content script that injects the popup and double-click listener into every page. The node.js API processes data from the Dictionary API (and other sources) for the extension to fetch.

Powered by the [Merriam-Webster dictionary API](https://dictionaryapi.com/).

[Feature roadmap](https://share.clickup.com/l/h/6-35841888-1/d7129f9d437b7e0)

## Structure

Check `src` to find the source files for the content script, popup and background page.

### Folders

+ `src/api` contains utility functions for accessing the API
+ `src/background` contains the extension's background script which sets the install/uninstall listeners, context menu items, keyboard shortcut listeners, messaging listeners, etc.
+ `src/common` contains JS and SCSS modules used by more than one of either the content script, background page, popup, internal pages, etc. This includes utility functions for storing user settings and the common CSS theme.
+ **`src/content`** contains the bulk of the extension: the actual synonym popups. It contains the content script(s), "page interface" script and HTML/CSS that is injected into each web page. 
+ `src/pages` contains the internal extension pages such as the help page and settings page. Each HTML file in this folder is automatically bundled by webpack to `/page/*.html` and `extensionPage.js` and `pageStyles.scss` are automatically added to each HTML file.
+ `src/popup` just contains the HTML/JS/CSS for the browser action (popup that opens when you click the extension icon).

### Commands

Install dependencies with `yarn`.

#### `yarn start`

Compiles to the `build` directory with watch mode enabled. You can then add the `build` folder to your browser for development by going to `chrome://extensions/`, enabling developer mode and choosing "Load unpacked". 

There's no hot reloading (yet), as the majority of the extension runs in a content script and background page where hot reloading doesn't really work. Instead, you'll have to press the refresh icon on the extensions page (next to the details/remove buttons) every time you change the content script or background page.

#### `yarn build`

Builds the extension without watch mode

#### `yarn build-zip`

Builds the extension in production mode to `build`, then zips the build directory into `dist.zip` (for upload to the web store).

### Contributing

Contributions are always welcomed! Please see [CONTRIBUTING.md](/CONTRIBUTING.md) for details.

### Legal

Simply Synonyms is licensed under GPL-3.0 and as such, usage/modifcation/distribution of any files in this extension must be in accordance with [`/LICENSE`](/LICENSE). The extension itself will remain open-source for the foreseeable future (probably forever), and the core API will likely remain open-source as well. 
