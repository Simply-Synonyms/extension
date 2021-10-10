// Copyright (C) 2020 Benjamin Ashbaugh
// licensed under GPL-3 at /LICENSE

import './styles.scss'
// import firebase from 'firebase/app'
// import 'firebase/auth'
// import firebaseConfig from 'firebaseConfig'
import { render } from 'preact'
import PopupApp from './App'

// firebase.initializeApp(firebaseConfig)

render(<PopupApp />, document.getElementById('app'))

// let disablePopupSwitch = document.getElementById('disable_switch')
// getSettings().then(
//   ({ popupDisabled }) => (disablePopupSwitch.checked = popupDisabled)
// )
// disablePopupSwitch.addEventListener('click', () =>
//   saveSettings({ popupDisabled: disablePopupSwitch.checked })
// )

// if (!('update_url' in browser.runtime.getManifest()))
//   document.getElementById('dev-badge').style.display = 'block'

// /* AUTHENTICATION */
// const googleSigninButton = document.getElementById('google-signin')
// const signinDiv = document.getElementById('signin-div')
// const signoutButton = document.getElementById('signout')
// const userWelcome = document.getElementById('user-welcome')

// const welcomeMessages = [
//   'Are you ready to start writing?',
//   'Are you ready to find some great words?',
//   'Are you looking forward to using Simply Synonyms today?',
//   'How has your day been so far?',
//   'Did you know you can see a list of upcoming features at the bottom of this page?',
//   'Did you know that Simply Synonyms is open source, meaning anyone who knows how to code can contribute to it?',
//   'What great words are you going to find today?',
//   'Thanks for using Simply Synonyms!',
//   'What a beautiful day.',
//   '',
// ]

// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     userWelcome.innerText = `Hello, ${user.displayName}. ${
//       welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
//     }`
//     signoutButton.classList.remove('hidden')
//     signinDiv.classList.add('hidden')
//   } else {
//     signoutButton.classList.add('hidden')
//     signinDiv.classList.remove('hidden')
//     userWelcome.innerText = ''
//   }
//   googleSigninButton.disabled = false
// })

// googleSigninButton.addEventListener('click', (e) => {
//   googleSigninButton.disabled = true
//   browser.runtime.sendMessage({ action: 'getAuthToken', interactive: true })
// })

// signoutButton.addEventListener('click', (e) => {
//   browser.runtime.sendMessage({ action: 'signOut' })
// })

// /* QUICK SEARCH */
// document.getElementById('open-quicksearch').addEventListener('click', (_) => {
//   browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//     if (tab.url === 'chrome://newtab/') {
//       browser.tabs.update(tab.id, { url: `https://www.merriam-webster.com/` })
//     } else browser.tabs.sendMessage(tab.id, { action: 'openQuickSearch' })
//   })
// })
