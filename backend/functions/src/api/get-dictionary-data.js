const getDictionaryResponse = require('../util/dictionary')

function getAudioURL (sound, fileType='mp3') {
  // https://dictionaryapi.com/products/json#sec-2.prs
  let subdir = sound.slice(0, 1)
  if (!sound.slice(0, 1).match(/[a-zA-Z]/i)) subdir = 'number'
  if (sound.startsWith('gg')) subdir = 'gg'
  if (sound.startsWith('bix')) subdir = 'bix'

  return `https://media.merriam-webster.com/audio/prons/en/us/${fileType}/${subdir}/${sound}.${fileType}`
}

function sendData (err, dictionaryRes) {
  if (err) return res.json({ error: 'Error accessing dictionary API' })

  if (!dictionaryRes || !dictionaryRes[0] || !dictionaryRes[0].hwi) {
    return res.json({
      error: "Word not found",
      errorCode: "no-word"
    })
  }

  const response = dictionaryRes.map(entry => {
    return {
      word: entry.hwi.hw,
      offensive: entry.meta.offensive,
      pronunciation: entry.hwi.prs?.[0]?.mw
    }
  })

  return res.json(response)
}

module.exports = function sendDictionaryData(req, res) {
  /*
  * Get word data from the Dictionary API
  *
  */

  const word = req.query.word
  if (!word) return res.json({ error: 'No word specified' })

  getDictionaryResponse(word, sendData)
}
