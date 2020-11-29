import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from 'firebaseConfig'
import chrome from 'browserApi'
import initializeAuth from './auth'

firebase.initializeApp(firebaseConfig)

if ('update_url' in chrome.runtime.getManifest()) chrome.runtime.setUninstallURL('https://forms.gle/5eR4sC3rW9UV93hUA')

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      option_popupDisabled: false,
      option_onlyEditableText: false
    }, () => {})
  }
})

// Init auth
initializeAuth()