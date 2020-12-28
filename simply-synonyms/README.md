## Simply Synonyms Browser Extension
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
