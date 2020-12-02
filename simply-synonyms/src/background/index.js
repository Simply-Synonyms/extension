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
