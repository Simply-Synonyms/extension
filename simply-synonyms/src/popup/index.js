import './styles.css'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from 'firebaseConfig'
import chrome from 'browserApi'

firebase.initializeApp(firebaseConfig)

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
const googleSigninButton = document.getElementById('google-signin')
const signinDiv = document.getElementById('signin-div')
const signoutButton = document.getElementById('signout')
const userWelcome = document.getElementById('user-welcome')

const welcomeMessages = [
  'Are you ready to start writing?',
  'Are you ready to find some great words?',
  'Are you looking forward to using Simply Synonyms today?',
  'How has your day been so far?',
  'Did you know you can see a list of upcoming features at the bottom of this page?',
  'Did you know that Simply Synonyms is open source, meaning anyone who knows how to code can contribute to it?',
  'What great words are you going to find today?',
  'Thanks for using Simply Synonyms!',
  'What a beautiful day.',
  ''
]

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userWelcome.innerText = `Hello, ${user.displayName}. ${welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}`
    signoutButton.classList.remove('hidden')
    signinDiv.classList.add('hidden')
  } else {
    signoutButton.classList.add('hidden')
    signinDiv.classList.remove('hidden')
    userWelcome.innerText = ''
  }
  googleSigninButton.disabled = false
});

googleSigninButton.addEventListener('click', (e) => {
  googleSigninButton.disabled = true
  chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: true})
})

signoutButton.addEventListener('click', (e) => {
  chrome.runtime.sendMessage({ action: 'signOut' })
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
