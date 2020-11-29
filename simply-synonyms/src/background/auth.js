import firebase from 'firebase/app'
import chrome from 'browserApi'

let authToken // NOT Firebase IdToken

function getAuthToken(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({ interactive }, (token) => {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token automatically.');
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      authToken = token
      // Authorize Firebase with the OAuth Access Token.
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential)
        .catch((err) => {
          // The OAuth token might have been invalidated; Remove it from cache.
          if (err.code === 'auth/invalid-credential') {
            chrome.identity.removeCachedAuthToken({ token }, () => startAuth(interactive));
          }
        });
    } else {
      console.error('The OAuth Token was null');
    }
  })
}

function signOut() {
  firebase.auth().signOut()
  chrome.identity.removeCachedAuthToken({ token: authToken })

  // We have to revoke the token as well or else the select account screen won't appear at next sign in.
  const revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + authToken;
  fetch(revokeUrl)
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  switch (msg.action) {
    case 'getAuthToken':
      getAuthToken(msg.interactive)
      break
    case 'refreshIdToken':
      firebase.auth().currentUser.getIdToken()
        .then(t => {
          chrome.storage.local.set({ idToken: t })
          respond(t)
        })
      break
    case 'signOut':
      signOut()
      break
  }
})

export default function initializeAuth () {
  firebase.auth().onAuthStateChanged((user) => {
    // console.log(user)
    if (user) {
      // Store IdToken so it can be used by content scripts
      user.getIdToken()
        .then(t => chrome.storage.local.set({ idToken: t }))
    } else {
      chrome.storage.local.remove(['idToken'])
    }
  })

  // Check for auth on app load
  getAuthToken(false)
}