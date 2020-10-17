const mail = require('../util/email')

module.exports = (user) => {
  mail.send('welcome', {
    'v:username': user.displayName
  }, 'Welcome to Simply Synonyms', user.email, ['weekly_email', 'welcome_email'])
  // mail.addUserToList({
  //   subscribed: true,
  //   address: user.email,
  //   name: user.displayName
  // }, 'weekly-stats')
}
