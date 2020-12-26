import browser from 'browserApi'

// Set this env var if you're working on the API locally with a firebase emulator
const apiURL = process.env.DEV_API ? process.env.DEV_API : 'https://us-central1-simply-synonyms-api.cloudfunctions.net/api/'

const GET = (route) => {
  return fetch(apiURL + route, {
    headers: !synonymsApi.idToken ? {} : {
      'Authorization': `Bearer ${synonymsApi.idToken}`
    }
  })
}

const synonymsApi = {
  idToken: null,
  setIdToken (t) {
    this.idToken = t
  },
  getSynonyms (word) {
    let userCancelledRequest = false // We don't actually cancel the request, but if the user closes the dialog before receiving synonym data, it doesn't increment the synonym counter.
    const onUserCancelledRequest = () => userCancelledRequest = true

    word = word.trim()
    const synonymRequestPromise = GET(`get-thesaurus-data?word=${word}`)
      .then(response => response.json())
      .then(data => {
        if (!!this.idToken && !userCancelledRequest) GET('update-user-stats') // Increment user's synonym counters once they recieve the synonym data
          .then(({ status }) => {
            if (status === 401) {
              browser.runtime.sendMessage(null, { action: 'refreshIdToken' }, {}, t => {
                this.idToken = t
                GET('update-user-stats') // try again
              }) // Check for a token refresh and update token when fetch is unauthorized
            }
          })
        return data
      })

    return [synonymRequestPromise, onUserCancelledRequest]
  },
  getWordDetails (word) {
    let userCancelledRequest = false // We don't actually cancel the request, but if the user closes the dialog before receiving synonym data, it doesn't increment the synonym counter.
    const onUserCancelledRequest = () => userCancelledRequest = true

    word = word.trim()
    const synonymRequestPromise = GET(`get-dictionary-data?word=${word}`)
      .then(response => response.json())
      .then(data => {
        if (!!this.idToken && !userCancelledRequest) GET('update-user-stats?worddata=1') // Increment user's synonym counters once they recieve the synonym data
          .then(({ status }) => {
            if (status === 401) {
              browser.runtime.sendMessage(null, { action: 'refreshIdToken' }, {}, t => {
                this.idToken = t
              }) // Check for a token refresh and update token when fetch is unauthorized
            }
          }).catch(console.error)
        return data
      })

    return [synonymRequestPromise, onUserCancelledRequest]
  }
}

browser.storage.local.get(['idToken'], ({ idToken: t }) => {
  synonymsApi.idToken = t
})

export default synonymsApi