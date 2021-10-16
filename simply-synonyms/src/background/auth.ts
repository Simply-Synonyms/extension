import firebase from 'firebase/app'
import {
  signInWithCustomToken,
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth'
import browser from 'browserApi'
import api from '../api'

// function getAuthToken(interactive) {
//   // Request an OAuth token from the Chrome Identity API.
//   // chrome.identity.getAuthToken({ interactive }, (token) => {
//   //   if (chrome.runtime.lastError && !interactive) {
//   //     console.log('It was not possible to get a token automatically.')
//   //   } else if (chrome.runtime.lastError) {
//   //     console.error(chrome.runtime.lastError)
//   //   } else if (token) {
//   //     authToken = token
//   //     // Authorize Firebase with the OAuth Access Token.
//   //     const credential = firebase.auth.GoogleAuthProvider.credential(
//   //       null,
//   //       token
//   //     )
//   //     firebase
//   //       .auth()
//   //       .signInWithCredential(credential)
//   //       .catch((err) => {
//   //         // The OAuth token might have been invalidated; Remove it from cache.
//   //         if (err.code === 'auth/invalid-credential') {
//   //           chrome.identity.removeCachedAuthToken({ token }, () =>
//   //             startAuth(interactive)
//   //           )
//   //         }
//   //       })
//   //   } else {
//   //     console.error('The OAuth Token was null')
//   //   }
//   // })
// }

// TODO verify orgin
browser.runtime.onMessageExternal.addListener((msg, sender, respond) => {
  const auth = getAuth()
  switch (msg.action) {
    case 'signInWithToken':
      signInWithCustomToken(auth, msg.token).catch((error) => {
        console.log('error', error)
      })
    case 'signOutExtension':
      signOut(auth)
  }
  return true
})

browser.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    // case 'refreshIdToken':
    //   firebase
    //     .auth()
    //     .currentUser?.getIdToken()
    //     ?.then((t) => {
    //       chrome.storage.local.set({ idToken: t })
    //       respond(t)
    //     })
    //   break
    case 'getUser':
      const user: User | null = getAuth().currentUser
      respond(user.toJSON())
      break
    case 'signOut':
      browser.tabs.create({
        url:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/app/logout'
            : 'https://synonyms.bweb.app/app/logout',
      })
      signOut(getAuth())
      break
  }
  return true
})

export default function initializeAuth() {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      console.log('Authenticated', user)
      // Store IdToken so it can be used by content scripts
      user.getIdToken().then((t) => {
        browser.storage.local.set({ idToken: t })
        // api.setIdToken(t)
      })
    } else {
      browser.storage.local.set({ idToken: null })
      console.log('Not authenticated')
    }
  })
}
