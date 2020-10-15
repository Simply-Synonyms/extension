const mail = require('../util/email')

module.exports = (user) => {
  mail.removeUserFromList(user.email, 'weekly-stats')
}
