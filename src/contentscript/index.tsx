// Copyright (C) 2021 Benjamin Ashbaugh
// Licensed under GPL-3 at /LICENSE

import injectPageScript from './embeddedScriptInterface'
import './css/styles.scss'
import { getSettings, saveSettings } from '../lib/settings'
import { render } from 'preact'
import App from './App'

function addExtension(settings) {
  if (settings.popupDisabled) return

  injectPageScript() // Inject utility script into the page itself

  const appContainer = document.createElement('div')
  appContainer.id = 'simply-synonyms-app-root'
  document.body.appendChild(appContainer)
  render(<App settings={settings} />, appContainer)
}

getSettings().then((settings) => {
  addExtension(settings)
})
