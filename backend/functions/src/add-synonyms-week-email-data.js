const admin = require('firebase-admin')
const getThesaurusResponse = require('./util/thesaurus')

// Convenience pubsub function for automatically adding synonyms to a week's email data

module.exports = function (msg) {
  const word = msg.attributes.word
  const defIndex = parseInt(msg.attributes.defIndex) // Definition index (which definition to get synonyms for)
  const dest = msg.attributes.dest // The destination weekly email data document

  return new Promise((resolve, reject) => {
    getThesaurusResponse(word, (err, thesaurusRes) => {
      if (err) {
        reject(err)
        return
      }

      const syns = thesaurusRes[0].meta.syns[defIndex]

      const synonymsOfWeek = syns.map((syn) => ({
        word: syn
      }))

      admin.firestore().collection('weekly-email-data').doc(dest).update({ synonymsOfWeek })
        .then(() => resolve())
        .catch(err => reject(err))
    })
  })
}
