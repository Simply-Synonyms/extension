const mail = require('../util/email')

module.exports = (ctx) => {
  mail.sendToList({
    subject: 'Your Weekly Synonyms',
    text: 'Congrats on using Simply Synonyms this week!'
  }, 'weekly-stats')
}
