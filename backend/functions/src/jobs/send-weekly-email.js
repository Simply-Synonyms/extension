const mail = require('../util/email')
const admin = require('firebase-admin')
const assert = require('assert')

function send(week, recipients, date) {
  // Send the weekly letter to each person in the recipients object
  mail.send('weekly', {
    wordOfWeek: week.wordOfWeek,
    definitionOfWeek: week.definitionOfWeek,
    synonymOfWeek: week.synonymOfWeek,
    synonymDefinition: week.synonymDefinition,
    synonymsOfWeek: week.synonymsOfWeek,
    notesOfWeek: week.notesOfWeek,
    authorOfWeek: week.authorOfWeek,
  }, `Your Weekly Synonym Dispatch (${date.getMonth() + 1}/${date.getDate()})`, recipients, [ 'weekly-email' ])
}

module.exports = (ctx, preview) => {
  const date = new Date()
  if (preview) date.setDate(date.getDate() + 1) // It's the preview so we're sending the email for the next day
  const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  let week
  let recipients = {}

  const emailDataRef = admin.firestore().collection('weekly-email-data').doc(today)

  // Get the week's email data
  return emailDataRef.get()
    .then((snap) => {
      week = snap.data()

      // Ensure that all the email data exists
      for (const key of ['wordOfWeek', 'definitionOfWeek', 'synonymOfWeek', 'synonymDefinition', 'synonymsOfWeek', 'notesOfWeek', 'authorOfWeek']) assert(Object.keys(week).includes(key))
      assert(typeof week.synonymsOfWeek[0].word === 'string')
      // assert(typeof week.notesOfWeek[0].p === 'string')
      assert(!week.SENT)

      // Get the users
      return admin.firestore().collection('users').get()
    })
    .then((snap) => {
      // Iterate over each user in the snapshot adding them to the recipients object
      snap.forEach((usnap) => {
        const user = usnap.data()
        recipients[user.email] = {
          name: user.name,
          weekly_synonyms: user.weekSynonymCount
        }
      })

      if (preview) {
        recipients = { // If it's a preview don't actually send to users
          'emailpreview@synonyms.bweb.app': {
            name: 'Synonym Devs',
            weekly_synonyms: '69420' // Yes, I'm immature
          }
        }

        week.notesOfWeek = '*** PREVIEW (will be sent to users tomorrow) *** ' + week.notesOfWeek
      }

      send(week, recipients, date)

      if (preview) return

      emailDataRef.update({
        SENT: true
      })

      return admin.firestore().collection('users').get() // Get the users collection again so that we can clear the streaks (using forEach twice wasn't working for some reason)
    })
    .then((snap) => {

      // Clear weekly synonym streaks
      let countClearPromises = []

      for (usnap of snap.docs) {
        console.log(`Adding ${JSON.stringify(usnap)} to array`)
        countClearPromises.push(usnap.ref.update({
          weekSynonymCount: 0,
          weekDictionaryCount: 0
        }))
      }

      return Promise.all(countClearPromises)
        .then(() => {
          console.log('Week streaks cleared')
        })
        .catch((err) => {
          return Promise.reject('Couldn\'t clear streaks')
        })
    })
    .catch((err) => {
      mail.errorAlert('Unable to send weekly email', err)
    })
}
