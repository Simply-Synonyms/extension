const mail = require('../util/email')

module.exports = (ctx) => {
  mail.batchSend('weekly', {
    'v:wordOfWeek': 'A TEST WORD OF WEEK',
    'v:definitionOfWeek': 'a beautiful definition',
    'v:synonymOfWeek': 'A wonderful word',
    'v:synonymDefinition': 'with a great definition',
    'v:synonymsOfWeek': [
      {
        'word': 'one'
      },
      {
        'word': 'two'
      }
    ],
    'v:notesOfWeek': 'Yeah it\'s a pretty great week overall!',
    'v:authorOfWeek': 'roborobo'
  }, 'Your Weekly Synonym Dispatch', {
    'scitronboy@gmail.com': { name: 'Benjamin', weekly_synonyms: '451' }
  }, [ 'weekly-email' ])
}
