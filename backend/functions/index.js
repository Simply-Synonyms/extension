const functions = require('firebase-functions')
const admin = require('firebase-admin')
const api = require('./src/api/index')
const onAccountCreate = require('./src/on-account-create')
const sendWeeklyEmail = require('./src/send-weekly-email')
const onAccountDelete = require('./src/on-account-delete')

admin.initializeApp()

/* Synonyms API */
exports.api = functions.https.onRequest(api)

/* Accounts and emails */
exports.onAccountCreation = functions.auth.user().onCreate(onAccountCreate)
exports.onAccountDeletion = functions.auth.user().onDelete(onAccountDelete)
exports.sendWeeklyEmail = functions.pubsub.schedule('every 4 minutes').onRun(sendWeeklyEmail)