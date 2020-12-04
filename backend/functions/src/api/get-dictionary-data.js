import getDictionaryResponse from '../util/dictionary'

function getAudioURL (sound, fileType='mp3') {
  if (!sound) return null
  // https://dictionaryapi.com/products/json#sec-2.prs
  let subdir = sound.slice(0, 1)
  if (!sound.slice(0, 1).match(/[a-zA-Z]/i)) subdir = 'number'
  if (sound.startsWith('gg')) subdir = 'gg'
  if (sound.startsWith('bix')) subdir = 'bix'

  return `https://media.merriam-webster.com/audio/prons/en/us/${fileType}/${subdir}/${sound}.${fileType}`
}

export default function sendDictionaryData(req, res) {
  /*
  * Get word data from the Dictionary API
  *
  */

  const word = req.query.word
  if (!word) return res.json({ error: 'No word specified' })

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
        functionalType: entry.fl,
        offensive: entry.meta.offensive,
        pronunciation: entry.hwi.prs?.[0]?.mw,
        audio: getAudioURL(entry.hwi.prs?.[0]?.sound.audio),
        date: entry.date,
        shortdefs: entry.shortdef
      }
    })

    return res.json({ homographs: response })
  }

  getDictionaryResponse(word, sendData)
}
