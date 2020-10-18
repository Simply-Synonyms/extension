const admin = require('firebase-admin')

// Verifying the auth token adds an extra 80ms to requests
// so I decided to increment user stats with a seperate function, and leave the main get-data function unauthorized

module.exports = function updateUserStats(req, res) {
  if (!req.user) return res.status(401).send("Not signed in")

  return admin.firestore().collection('users').doc(req.user.uid).get()
    .then((snap) => {
      return snap.ref.set({
        email: req.user.email,
        name: req.user.name,
        weekSynonymCount: (snap.get('weekSynonymCount') || 0) + 1,
        lifeSynonymCount: (snap.get('lifeSynonymCount') || 0) + 1
      })
    })
    .then((snap) => {
      return res.json({ success: true })
    })
}
