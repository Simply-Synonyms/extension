const admin = require('firebase-admin')

const validateFirebaseIdToken = (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return next()
  }

  let idToken = req.headers.authorization.split('Bearer ')[1]

  const decodedIdToken = admin.auth().verifyIdToken(idToken, true) // Verify ID token and ensure that it isn't revoked
    .then((decodedToken) => {
      req.user = decodedToken // Set the user object to the decoded JWT
      next()
    })
    .catch((err) => {
      next() // Call next without req.user
    })
}

module.exports = validateFirebaseIdToken
