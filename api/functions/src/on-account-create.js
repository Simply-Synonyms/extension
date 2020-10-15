const mail = require('../util/email')


module.exports = (user) => {
  mail.send('welcome', {
    'v:username': user.displayName
  }, 'Welcome to Simply Synonyms!', user.email)
  mail.addUserToList({
    subscribed: true,
    address: user.email,
    name: user.displayName
  }, 'weekly-stats')
}
