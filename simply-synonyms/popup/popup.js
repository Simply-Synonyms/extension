let onlyEditableText = document.getElementById('only_editable_text_switch')
let disablePopup = document.getElementById('disable_switch')


/* SETTINGS AND OPTIONS */
function settingsChanged() {
  chrome.storage.local.set({
    option_popupDisabled: disablePopup.checked,
    option_onlyEditableText: onlyEditableText.checked
  }, () => {

  })
}

chrome.storage.local.get(['option_popupDisabled', 'option_onlyEditableText'], (result) => {
  disablePopup.checked = result.option_popupDisabled
  onlyEditableText.checked = result.option_onlyEditableText
})

onlyEditableText.addEventListener('click', settingsChanged)
disablePopup.addEventListener('click', settingsChanged)

document.getElementById('version-text').innerText = `V${chrome.runtime.getManifest().version}`

if (!('update_url' in chrome.runtime.getManifest())) document.getElementById('dev-badge').style.display = 'block'

/* AUTHENTICATION */
const signinButton = document.getElementById('google-signin')


function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({ interactive }, (token) => {
    signinButton.disabled = false
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token automatically.');
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authorize Firebase with the OAuth Access Token.
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential)
        .then(() => {
          signinButton.innerText = 'Sign out'
        })
        .catch((err) => {
        // The OAuth token might have been invalidated; Remove it from cache.
        if (err.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, () => startAuth(interactive));
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  })
}

signinButton.addEventListener('click', (e) => {
  if (firebase.auth().currentUser) {
    signinButton.disabled = false
    firebase.auth().signOut()
      .then(() => {
        signinButton.innerText = 'Sign in with Google'
      })
  } else {
    signinButton.disabled = true
    startAuth(true)
  }
})

/* QUICK SEARCH */
document.getElementById('quicksearch').addEventListener('input', (e) => {
  const quicksearchPrompt = document.getElementById('quicksearch-prompt')
  if (e.target.value.length !== 0) {
    quicksearchPrompt.style.visibility = 'visible'
  } else {
    quicksearchPrompt.style.visibility = 'hidden'
  }
})

document.getElementById('quicksearch').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //   chrome.tabs.sendMessage(tabs[0].id, { action: 'search', word: e.target.value });
    // })
    chrome.tabs.create({ url: `https://www.merriam-webster.com/thesaurus/${encodeURI(e.target.value)}`})
  }
})