const mail = require('./util/email')

module.exports = (user) => {
  return admin.firestore().collection('users').doc(user.uid).delete()
}
