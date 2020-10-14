const functions = require('firebase-functions')
const getThesaurusData = require('./get-thesaurus-data')

exports.getThesaurusData = functions.https.onRequest(getThesaurusData)
