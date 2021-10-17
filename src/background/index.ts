import { initializeApp } from 'firebase/app'
import firebaseConfig from 'firebaseConfig'
import initializeAuth from './auth'
import createContextMenus from './contextMenus'
import browser from 'browserApi'
import { resetSettings } from '../lib/settings'
import { processApiRequest } from '../api'
import { getIdToken, getAuth } from '@firebase/auth'

initializeApp(firebaseConfig)

if ('update_url' in browser.runtime.getManifest())
  browser.runtime.setUninstallURL('https://forms.gle/5eR4sC3rW9UV93hUA')

browser.runtime.onInstalled.addListener((details) => {
  const version = browser.runtime.getManifest().version
  if (
    details.reason === 'install' ||
    version === '0.3.5' ||
    version === '0.3.6' ||
    version === '0.3.7'
  ) {
    // Set default settings
    resetSettings()
  }
})

createContextMenus()
initializeAuth()

browser.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    case 'processApiRequest':
      ;(async () => {
        const user = getAuth().currentUser
        respond(await processApiRequest(msg, user && (await getIdToken(user))))
      })()
      return true
    case 'playAudio':
      // We have to play audio files from the background so that websites' CSP headers don't interfere
      new Audio(msg.url).play()
      break
    case 'doQuickSearch':
      let searchUrl
      switch (msg.dictionaryProvider) {
        case 'dictionary.com':
          searchUrl = `https://www.${
            msg.searchDictionary ? 'dictionary' : 'thesaurus'
          }.com/browse/${encodeURIComponent(msg.word)}?ref=simply-synonyms`
          break
        default:
          searchUrl = `https://www.merriam-webster.com/${
            msg.searchDictionary ? 'dictionary' : 'thesaurus'
          }/${encodeURIComponent(msg.word)}?ref=simply-synonyms`
      }

      // Open new tab directly to the left of active tab:
      browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        browser.tabs.create({ url: searchUrl, index: tab.index })
      })
      break
  }
})
