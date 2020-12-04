import admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import onAccountCreate from './users/on-account-create'
import api from './api'
import sendWeeklyEmail from './jobs/send-weekly-email'
import onAccountDelete from './users/on-account-delete'
import cloneWeeklyEmailData from './tools/clone-weekly-email-data'
import backupDatabase from './jobs/backup-database'
import addSynonymsToWeekEmailData from './tools/add-synonyms-week-email-data'

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