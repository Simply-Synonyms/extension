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
            } catch {
                cb('Unable to decode JSON: ' + body)
                return
            }
            cb(null, body)
        });
    });
}

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
