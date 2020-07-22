const express = require('express')
const router = express.Router()
const https = require('https')


const thesaurusAPIKey = process.env.THESAURUS_API_KEY // register for an API key at https://dictionaryapi.com/

function getThesaurusResponse(word, cb) {
  const url = `https://dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${thesaurusAPIKey}`

  https.get(url, res => {
    res.setEncoding("utf8")
    let body = ""
    res.on("data", data => {
      body += data
    })
    res.on("end", () => {
      try {
        body = JSON.parse(body)
        cb(body)
      } catch {
        cb('Unable to decode JSON: ' + body)
      }
    });
  });
}

router.get('/get-synonyms', function(req, res, next) {
  let word = req.query.word
  if (!word) return res.json({ error: 'No word specified' })

  let sendSynonyms = (err, thesaurusRes) => {
    if (err) return res.json({ error: err })
    return res.json(thesaurusRes)
  }
  return getThesaurusResponse(word, sendSynonyms)
})

router.get('*', function(req, res, next) {
  return res.status(404).json({
    error: '404 route not found'
  })
})

module.exports = router
