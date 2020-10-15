const functions = require('firebase-functions')
const getThesaurusData = require('./src/get-thesaurus-data')
const sendWelcomeEmail = require('./src/send-welcome-email')

exports.getThesaurusData = functions.https.onRequest(getThesaurusData)
exports.sendWelcomeEmail = functions.auth.user().onCreate(sendWelcomeEmail)
