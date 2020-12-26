import firebase from 'firebase/app'
import firebaseConfig from 'firebaseConfig'
import setListeners from './setListeners'
import initializeAuth from './auth'
import createContextMenus from './contextMenus'
import browser from 'browserApi'

firebase.initializeApp(firebaseConfig)

// Initialize auth, uninstall/install listeners, context menus, etc.
setListeners()
createContextMenus()
initializeAuth()

browser.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    case 'playAudio':
      // We have to play audio files from the background so that websites' CSP headers don't interfere
      new Audio(msg.url).play()
      break
    case 'openQuickSearch':
      let searchUrl
      switch (msg.dictionaryProvider) {
        case 'dictionary.com':
          searchUrl = `https://www.${msg.searchDictionary ? 'dictionary' : 'thesaurus'}.com/browse/${encodeURIComponent(msg.word)}?ref=simply-synonyms`
          break
        default:
          searchUrl = `https://www.merriam-webster.com/${msg.searchDictionary ? 'dictionary' : 'thesaurus'}/${encodeURIComponent(msg.word)}?ref=simply-synonyms`
      }

      // Open new tab directly to the left of active tab:
      browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        browser.tabs.create({ url: searchUrl, index: tab.index})
      })
      break
  }
  // return true
})
