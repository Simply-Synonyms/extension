import * as functions from 'firebase-functions'
import https from 'https'

// Set this with: firebase functions:config:set dictionaryapi.key="yourkey"
// Register for an API key at https://dictionaryapi.com/
const dictionaryAPIKey = functions.config().dictionaryapi.key

export default function getDictionaryResponse(word, cb) {
  const url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${dictionaryAPIKey}`

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