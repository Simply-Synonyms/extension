const mail = require('./util/email')

module.exports = (user) => {
  mail.removeUserFromList(user.email, 'users')
  mail.removeUserFromList(user.email, 'announcements')
  return admin.firestore().collection('users').doc(user.uid).delete()
}
