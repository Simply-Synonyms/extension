const mail = require('./email')


module.exports = (user) => {
  mail.send({
    subject: "Welcome to Simply Synonyms",
    text: `Hello ${user.displayName}! Thanks for signing in to simply synonyms! We will send you a weekly email with customized stats and helpful synonyms.`
  }, user.email)
  mail.addUserToList({
    subscribed: true,
    address: user.email,
    name: user.displayName
  }, 'weekly-stats')
}
