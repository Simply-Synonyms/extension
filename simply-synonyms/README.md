## Simply Synonyms Browser Extension
Check `src` to find the source files for the content script, popup and background page.

### Commands

Install dependencies with `yarn`.

#### `yarn start`

Compiles to the `build` directory with watch mode enabled. You can then add the `build` folder to your browser for development by going to `chrome://extensions/`, enabling developer mode and choosing "Load unpacked". 

There's no hot reloading (yet), as the majority of the extension runs in a content script and background page where hot reloading doesn't really work. Instead, you'll have to press the refresh icon on the extensions page (next to the details/remove buttons) every time you change the content script or background page.

#### `yarn build`

Builds the extension without watch mode

#### `yarn build-zip`

Builds the extension in production mode to `build`, then zips the build directory into `dist.zip` (for upload to the web store).