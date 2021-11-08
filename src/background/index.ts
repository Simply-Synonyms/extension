import { initializeApp } from 'firebase/app'
import firebaseConfig from 'firebaseConfig'
import initializeAuth from './auth'
import createContextMenus from './contextMenus'
import browser from 'browserApi'
import { resetSettings } from '../lib/settings'
import { processApiRequest } from '../api'
import { getIdToken, getAuth } from '@firebase/auth'
import { WEBSITE_URL } from '../config'
import initializeOmniboxShortcut from './omnibox'
import initSentry from '../lib/sentry'

initializeApp(firebaseConfig)
initSentry('background')

const manifest = browser.runtime.getManifest()

if ('update_url' in manifest)
  browser.runtime.setUninstallURL(
    `https://simplysynonyms.typeform.com/to/lWki42Kx#extension_version=${manifest.version}`
  )

browser.runtime.onInstalled.addListener(details => {
  const version = manifest.version
  browser.storage.sync.get('v1_installed', ({ v1_installed }) => {
    if (!v1_installed) {
      // Set default settings
      resetSettings()

      const onboardingUrl =
        WEBSITE_URL +
        `/onboarding?v=${encodeURIComponent(version)}${
          details.reason !== 'install' ? '&fromAlpha=1' : ''
        }`
      browser.tabs.create({
        url: onboardingUrl,
      })
    }
  })

  browser.storage.sync.set({ v1_installed: true })
})

createContextMenus()
initializeAuth()
initializeOmniboxShortcut()

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
    // case 'getTabId':
    //   respond(sender.tab.id)
    // case 'pasteIntoPage':
    //   browser.tabs.executeScript(sender.tab.id, {/*frameId:,*/ matchAboutBlank: true, code:
    //     ";"
    //   })
    //   break
    // case 'getClipboardText': {
    //   // Create a temp div to paste clipboard value into
    //   const tempInput = document.createElement('input')
    //   document.body.appendChild(tempInput)
    //   tempInput.focus()
    //   document.execCommand('paste')
    //   const text = tempInput.value
    //   document.body.removeChild(tempInput)
    //   respond(text)
    //   break
    // }
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
