import browser from 'browserApi'

const apiURL = 'https://us-central1-simply-synonyms-api.cloudfunctions.net/api/'

const GET = (route) => {
  return fetch(apiURL + route, {
    headers: !synonymsApi.idToken ? {} : {
      'Authorization': `Bearer ${synonymsApi.idToken}`
    }
  })
}

const synonymsApi = {
  idToken: null,
  setIdToken: t => { this.idToken = t },
  getSynonyms (word) {
    word = word.trim()
    if (!!this.idToken) GET('update-user-stats') // Increment user's synonym counters
      .then(({ status }) => {
        if (status === 401) {
          browser.runtime.sendMessage(null, { action: 'refreshIdToken' }, {}, t => {
            this.idToken = t
          }) // Check for a token refresh and update token when fetch is unauthorized
        }
      })
    return GET(`get-thesaurus-data?word=${word}`)
      .then(response => response.json())
  }
}

browser.storage.local.get(['idToken'], ({ idToken: t }) => {
  synonymsApi.idToken = t
})

export default synonymsApi