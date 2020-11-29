import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from 'firebaseConfig'
import setListeners from './setListeners'
import initializeAuth from './auth'

firebase.initializeApp(firebaseConfig)

// Set uninstall/install listeners
setListeners()

// Init auth
initializeAuth()
