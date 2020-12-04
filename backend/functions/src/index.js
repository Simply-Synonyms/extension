const functions = require('firebase-functions')
const admin = require('firebase-admin')
const api = require('./api')
const onAccountCreate = require('./users/on-account-create')
const sendWeeklyEmail = require('./jobs/send-weekly-email')
const onAccountDelete = require('./users/on-account-delete')
const cloneWeeklyEmailData = require('./tools/clone-weekly-email-data')
const backupDatabase = require('./jobs/backup-database')
const addSynonymsToWeekEmailData = require('./tools/add-synonyms-week-email-data')

admin.initializeApp()

/* Synonyms API */
exports.api = functions.https.onRequest(api)

/* Accounts and emails */
exports.onAccountCreation = functions.auth.user().onCreate(onAccountCreate)
exports.onAccountDeletion = functions.auth.user().onDelete(onAccountDelete)
exports.sendWeeklyEmail = functions.pubsub.schedule('every mon 09:00').onRun((ctx) => sendWeeklyEmail(ctx))

/* Maintenance/convenience/util */
exports.sendWeeklyPreviewEmail = functions.pubsub.schedule('every sun 07:30').onRun((ctx) => sendWeeklyEmail(ctx, true))
exports.cloneWeeklyEmailData = functions.pubsub.topic('cloneWeeklyEmailData').onPublish(cloneWeeklyEmailData)
exports.addSynonymsToWeekEmailData = functions.pubsub.topic('addSynonymsToWeekEmailData').onPublish(addSynonymsToWeekEmailData)
// exports.backupDatabase = functions.pubsub.schedule('every week').onRun(backupDatabase)