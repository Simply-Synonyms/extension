import firebase from 'firebase/app'
import firebaseConfig from 'firebaseConfig'
import setListeners from './setListeners'
import initializeAuth from './auth'
import browser from 'browserApi'

firebase.initializeApp(firebaseConfig)

// Set uninstall/install listeners
setListeners()

// Init auth
initializeAuth()

browser.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    case 'playAudio':
      // We have to play audio files from the background so that websites' CSP headers don't interfere
      new Audio(msg.url).play()
      break
  }
  // return true
})
