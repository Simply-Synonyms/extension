import browser from 'browserApi'

// Set this env var if you're working on the API locally with a firebase emulator
const baseURL =
  (process.env.DEV_API
    ? process.env.DEV_API
    : 'https://us-central1-simply-synonyms-apiv1.cloudfunctions.net/extension') +
  '/'

type ApiEndpointName =
  | 'getThesaurusData'
  | 'getDictionaryData'
  | 'favoriteWord'
  | 'getFavoriteWords'

const apiRequest = (
  method: 'GET' | 'POST',
  endpoint: string,
  idToken?: string,
  body?: Record<string, any>
) => {
  return fetch(baseURL + endpoint, {
    method,
    headers: {
      Authorization: idToken && `Bearer ${idToken}`,
    },
    body: body && JSON.stringify(body),
  }).then((r) => r.json())
}

export function processApiRequest(
  msg: {
    action: 'processApiRequest'
    endpoint: ApiEndpointName
    [key: string]: any
  },
  idToken?: string
) {
  console.log(
    `Processing request (with${idToken ? '' : 'out'} authentication):`,
    msg
  )
  switch (msg.endpoint) {
    case 'getThesaurusData': {
      const req = apiRequest(
        'GET',
        `get-thesaurus-data?word=${encodeURIComponent(msg.word.trim())}`,
        idToken
      )

      return req
    }
    case 'getDictionaryData': {
      return apiRequest(
        'GET',
        `get-dictionary-data?word=${encodeURIComponent(msg.word.trim())}`,
        idToken
      )
    }
    case 'favoriteWord': {
      return apiRequest('POST', `favorite-word`, idToken, {
        word: msg.word,
        remove: msg.remove,
      })
    }
    case 'getFavoriteWords': {
      return apiRequest('GET', `get-favorite-words`, idToken)
    }
  }
}

function sendRequestToBackground(endpoint: ApiEndpointName, data: any = {}) {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(
      {
        action: 'processApiRequest',
        endpoint,
        ...data,
      },
      resolve
    )
  }) as Promise<any>
}

export interface GetThesaurusDataResponse {
  shortdefs: string[]
  synonyms: string[][]
  antonyms: string[][]
}
export const getThesaurusData = (
  word: string
): Promise<GetThesaurusDataResponse> =>
  sendRequestToBackground('getThesaurusData', { word })

export interface GetWordDataResponse {
  homographs: {
    offensive: boolean
    pronunciation?: string
    audio?: string
    shortdefs: string[]
    functionalType: string
    word: string
    date: string
  }[]
  isFavorite?: boolean
}
export const getWordData = (word: string): Promise<GetWordDataResponse> =>
  sendRequestToBackground('getDictionaryData', { word })

export interface FavoriteWordResponse {
  success: boolean
  word: string
  favorite: boolean
}
export const favoriteWord = (
  word: string,
  remove: boolean
): Promise<FavoriteWordResponse> =>
  sendRequestToBackground('favoriteWord', { word, remove })

export interface GetFavoriteWordsResponse {
  favoriteWords: {
    id: number
    word: string
  }[]
}
export const getFavoriteWords = (): Promise<GetFavoriteWordsResponse> =>
  sendRequestToBackground('getFavoriteWords')
