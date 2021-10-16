# Simply Synonyms

A lightweight thesaurus extension for Chrome: double click any word to find synonyms, antonyms, and other useful information. [Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/simply-synonyms/hapeijdlgbbhjmijhmgggnakcgdcpfap).

The extension uses a content script that injects a Preact-powered popup and event listener into every page, which consumes data from a node.js API powered by the [Merriam-Webster dictionary API](https://dictionaryapi.com/).

The API and website are currently closed-source.

[Feature roadmap](https://share.clickup.com/l/h/6-35841888-1/d7129f9d437b7e0)

## Structure

+ `config` - Webpack, Typescript and Prettier config
+ `assets` - Fonts, icons, images
+ `src/api` - Simply Synonyms API wrapper
+ `src/background` - The extension's background script which sets the install/uninstall listeners, context menu items, keyboard shortcut listeners, messaging listeners, auth handlers, etc.
+ `src/lib` contains utility functions and other code used by multiple parts of the extension.
+ `src/styles` - Shared SCSS styles
+ **`src/contentscript`** - Contains the bulk of the extension: the actual synonym popup. It contains the content script(s), "page interface" script, and React HTML/CSS that is injected into each web page. 
+ `src/pages` - Contains the internal extension pages such as the help page and settings page. Each HTML file in this folder is automatically bundled by webpack to `/page/*.html` and `extensionPage.js` and `pageStyles.scss` are automatically added to each HTML file.
+ `src/popup` - Contains the Preact app for the browser action (popup that opens when you click the extension icon).
+ `manifest.json` - The extension manifest

### Commands

#### `yarn dev`

Compiles to the `build` directory with watch mode enabled. You can then add the `build` folder to your browser for development by going to `chrome://extensions/`, enabling developer mode and choosing "Load unpacked". 

There's no hot reloading (yet), as the majority of the extension runs in a content script and background page where hot reloading would be very complicated to set up. Instead, you'll have to press the refresh icon on the extensions page (next to the details/remove buttons) every time you change the content script or background page.

#### `yarn build` && `yarn build-prod`

Builds the extension without watch mode

#### `yarn build-zip`

Builds the extension in production mode to `build`, then zips the build directory into `dist.zip` (for upload to the web store).

#### `yarn format`

Run prettier

### Contributing

Contributions are always welcomed! Please see [CONTRIBUTING.md](/CONTRIBUTING.md) for details.

### Legal

Simply Synonyms is licensed under GPL-3.0 and as such, usage/modifcation/distribution of any files in this extension must be in accordance with [`/LICENSE`](/LICENSE). 
