// Copyright (C) 2020 Benjamin Ashbaugh
// licensed under GPL-3 at /LICENSE

import './styles.scss'
// import firebase from 'firebase/app'
// import 'firebase/auth'
// import firebaseConfig from 'firebaseConfig'
import { render } from 'preact'
import PopupApp from './App'
import { getSettings } from '../lib/settings'

// firebase.initializeApp(firebaseConfig)

getSettings().then((s) => {
  render(<PopupApp settings={s} />, document.getElementById('app'))
})
