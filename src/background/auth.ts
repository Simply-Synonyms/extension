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
        console.log('Error authenticating', error)
      })
    case 'signOutExtension':
      signOut(auth)
  }
  return true
})

browser.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    case 'checkIsLoggedIn':
      respond(!!getAuth().currentUser)
      break
    case 'getUser':
      const user: User | null = getAuth().currentUser
      respond(user?.toJSON())
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
    } else {
      console.log('Not authenticated')
    }
  })
}
