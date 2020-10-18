const admin = require('firebase-admin')

const validateFirebaseIdToken = (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) next()

  let idToken = req.headers.authorization.split('Bearer ')[1]

  const decodedIdToken = admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken
      next()
    })
}

module.exports = validateFirebaseIdToken
