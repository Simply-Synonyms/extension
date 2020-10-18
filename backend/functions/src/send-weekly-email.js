const mail = require('./util/email')
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

  // Get the week's email data
  return admin.firestore().collection('weekly-email-data').doc(today).get()
    .then((snap) => {
      week = snap.data()

      // Ensure that all the email data exists
      for (const key of ['wordOfWeek', 'definitionOfWeek', 'synonymOfWeek', 'synonymDefinition', 'synonymsOfWeek', 'notesOfWeek', 'authorOfWeek']) assert(Object.keys(week).includes(key))
      assert(typeof week.synonymsOfWeek[0].word === 'string')

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

      // Clear weekly synonym streaks
      let countClearPromises = []

      snap.forEach((usnap) => {
        // Add a function to clear each user's streak to the promise array
        countClearPromises.push(() => usnap.ref.set({
          weekSynonymCount: 0
        }, { merge: true }))
      })

      return Promise.all(countClearPromises)
    })

}
