const mail = require('./util/email')

module.exports = (user) => {
  mail.send('welcome', {
    username: user.displayName
  }, 'Welcome to Simply Synonyms, ' + user.displayName, user.email, ['weekly_email', 'welcome_email'])
  mail.addUserToList({
    subscribed: true,
    address: user.email,
    name: user.displayName
  }, 'users')
  mail.addUserToList({
    subscribed: true,
    address: user.email,
    name: user.displayName
  }, 'announcements')
}
