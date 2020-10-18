const admin = require('firebase-admin')

// Convenience pubsub function for cloning a week's email data (you'd think this would be built into the firestore UI but I guess not)

module.exports = function (msg) {
  const src = msg.attributes.src
  const dest = msg.attributes.dest

  return admin.firestore().collection('weekly-email-data').doc(src).get()
    .then((snap) => {
      data = snap.data()
      if (!data.wordOfWeek) return
      return admin.firestore().collection('weekly-email-data').doc(dest).set(data)
    })
}
