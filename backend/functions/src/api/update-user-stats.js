import admin from 'firebase-admin'
// I decided to increment user stats with a seperate function
// For more flexibility and accuracy

export default function updateUserStats(req, res) {
  if (!req.user) return res.status(401).send("Not signed in")

  return admin.firestore().collection('users').doc(req.user.uid).get()
    .then((snap) => {
      // This was from a word data request not a synonym request
      if (!!req.query.worddata) {
        return snap.ref.update({
          email: req.user.email,
          name: req.user.name,
          weekDictionaryCount: (snap.get('weekDictionaryCount') || 0) + 1,
          lifeDictionaryCount: (snap.get('lifeDictionaryCount') || 0) + 1,
          yearDictionaryCount: (snap.get('yearDictionaryCount') || 0) + 1,
        })
      } else return snap.ref.update({
        email: req.user.email,
        name: req.user.name,
        weekSynonymCount: (snap.get('weekSynonymCount') || 0) + 1,
        lifeSynonymCount: (snap.get('lifeSynonymCount') || 0) + 1,
        yearSynonymCount: (snap.get('yearSynonymCount') || 0) + 1,
      })
    })
    .then((snap) => {
      return res.json({ success: true })
    })
}
