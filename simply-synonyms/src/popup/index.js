import './styles.scss'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from 'firebaseConfig'
import browser from 'browserApi'

firebase.initializeApp(firebaseConfig)

let disablePopupSwitch = document.getElementById('disable_switch')

browser.storage.local.get(['option_popupDisabled'], (result) => {
  disablePopupSwitch.checked = result.option_popupDisabled
})

disablePopupSwitch.addEventListener('click', () => browser.storage.local.set({
  option_popupDisabled: disablePopupSwitch.checked
}))

document.getElementById('version-text').innerText = `V${browser.runtime.getManifest().version}`

if (!('update_url' in browser.runtime.getManifest())) document.getElementById('dev-badge').style.display = 'block'

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
  browser.runtime.sendMessage({ action: 'getAuthToken', interactive: true})
})

signoutButton.addEventListener('click', (e) => {
  browser.runtime.sendMessage({ action: 'signOut' })
})

/* QUICK SEARCH */
document.getElementById('open-quicksearch').addEventListener('click', _ => {
  browser.tabs.query({ active: true, currentWindow: true}, ([tab]) => {
    if (tab.url === 'chrome://newtab/') {
      browser.tabs.update(tab.id, { url: `https://www.merriam-webster.com/` })
    } else browser.tabs.sendMessage(tab.id, { action: "openQuickSearch" })
  })
})

