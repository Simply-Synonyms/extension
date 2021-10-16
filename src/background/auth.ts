import {
  signInWithCustomToken,
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth'
import browser from 'browserApi'

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
