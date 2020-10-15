const functions = require('firebase-functions')
const getThesaurusData = require('./src/get-thesaurus-data')
const onAccountCreate = require('./src/on-account-create')
const sendWeeklyEmail = require('./src/send-weekly-email')
const onAccountDelete = require('./src/on-account-delete')

/* Synonyms */
exports.getThesaurusData = functions.https.onRequest(getThesaurusData)

/* Accounts and emails */
exports.onAccountCreation = functions.auth.user().onCreate(onAccountCreate)
exports.onAccountDeletion = functions.auth.user().onDelete(onAccountDelete)
exports.sendWeeklyEmail = functions.pubsub.schedule('every 30 seconds').onRun(sendWeeklyEmail)