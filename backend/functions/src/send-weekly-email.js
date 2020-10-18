const mail = require('./util/email')

module.exports = (ctx) => {
  mail.send('weekly', {
    wordOfWeek: 'tendentious',
    definitionOfWeek: 'marked by a tendency in favor of a particular point of view',
    synonymOfWeek: 'amazing',
    synonymDefinition: 'SUPER AMAZING',
    synonymsOfWeek: [
      {
        word: 'astonishing'
      },
      {
        word: 'astounding'
      },
      {
        word: 'shocking'
      }
    ],
    notesOfWeek: 'So, this is the first ever weekly simply synonyms dispatch! We’re super excited to keep developing Simply Synonyms and adding new features to it. Hopefully, you find the synonyms, stats, words, and who knows what else in this weekly email useful or entertaining!',
    authorOfWeek: 'Benjamin'
  }, 'Your Weekly Synonym Dispatch', {
    'scitronboy@gmail.com': { name: 'Benjamin', weekly_synonyms: '451' },
  }, [ 'weekly-email' ])
}
