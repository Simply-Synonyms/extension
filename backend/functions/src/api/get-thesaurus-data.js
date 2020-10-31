const getThesaurusResponse = require('../util/thesaurus')

module.exports = function sendThesaurusData(req, res) {
  /*
  * Get synonyms and antonyms for a word from the Thesaurus API
  * Right now it just returns an array of arrays of synonyms, and an array of short definitions from the top word dataset returned by the API.
  */

  let word = req.query.word
  if (!word) return res.json({ error: 'No word specified' })

  let sendData = (err, thesaurusRes) => {
    if (err) return res.json({ error: err })

    if (!thesaurusRes || !thesaurusRes[0] || !thesaurusRes[0].meta) {
      return res.json({
        error: "Word not found",
        errorCode: "no-word"
      })
    }

    let topWord = thesaurusRes[0]
    return res.json({
      synonyms: topWord.meta.syns,
      shortdefs: topWord.shortdef,
      antonyms: topWord.meta.ants
    })
  }
  getThesaurusResponse(word, sendData)
}
