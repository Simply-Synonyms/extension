const https = require('https')
const functions = require('firebase-functions')

// Set this with: firebase functions:config:set thesaurusapi.key="yourkey"
// Register for an API key at https://dictionaryapi.com/
const thesaurusAPIKey = functions.config().thesaurusapi.key

module.exports = function getThesaurusResponse(word, cb) {
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
      } catch {
        cb('Unable to decode JSON: ' + body)
        return
      }
      cb(null, body)
    });
  });
}