import browser from 'browserApi'

// Set this env var if you're working on the API locally with a firebase emulator
const baseURL = process.env.DEV_API
  ? process.env.DEV_API
  : 'https://us-central1-simply-synonyms.cloudfunctions.net/extension'

type ApiEndpointName =
  | 'getThesaurusData'
  | 'getDictionaryData'
  | 'favoriteWord'
  | 'getFavoriteWords'
  | 'rewritePhrase'
  | 'getAccountStatus'
  | 'autocompleteSearch'
  | 'search'
  | 'getCollections'
  | 'createCollection'
  | 'createCollectionItem'
  | 'getCollectionItems'

/** Only use from background script */
export const apiRequest = (
  method: 'GET' | 'POST',
  endpoint: string,
  idToken?: string,
  body?: Record<string, any>
) => {
  return fetch(baseURL + '/' + endpoint, {
    method,
    headers: {
      Authorization: idToken && `Bearer ${idToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body && JSON.stringify(body),
  }).then(r => r.json())
}

function sendRequestToBackground(endpoint: ApiEndpointName, data: any = {}) {
  const thisIsBackground =
    browser.extension.getBackgroundPage &&
    window === browser.extension.getBackgroundPage()
  if (thisIsBackground)
    return processApiRequest({
      action: 'processApiRequest',
      endpoint,
      ...data,
    })
  else
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
    case 'rewritePhrase': {
      return apiRequest('POST', `rewrite-phrase`, idToken, {
        text: msg.text,
      })
    }
    case 'getAccountStatus': {
      return apiRequest('GET', `account`, idToken)
    }
    case 'autocompleteSearch':
      return apiRequest('GET', `autocomplete-search?text=${msg.text}`)
    case 'search':
      return apiRequest('GET', `search?q=${msg.query}`)
    case 'getCollections':
      return apiRequest('GET', `collection/get-all`, idToken)
    case 'createCollectionItem':
      return apiRequest('POST', 'collection/create-item', idToken, {
        text: msg.text,
        cid: msg.cid,
        cname: msg.cname,
      })
    case 'getCollectionItems':
      return apiRequest('GET', `collection/get-items?cid=${msg.cid}`, idToken)
  }
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

export interface RewritePhraseResponse {
  newPhrases: {
    text: string
    index: number
  }[]
}
export const rewritePhrase = (text: string): Promise<RewritePhraseResponse> =>
  sendRequestToBackground('rewritePhrase', { text })

export interface GetAccountStatusResponse {
  premiumActive: boolean
}
export const getAccountStatus = (): Promise<GetAccountStatusResponse> =>
  sendRequestToBackground('getAccountStatus')

export interface AutocompleteSearchResponse {
  suggestions: string[]
}
export const autocompleteSearch = (
  text: string
): Promise<AutocompleteSearchResponse> =>
  sendRequestToBackground('autocompleteSearch', { text })

export interface SearchResponse {
  query: string
  results: string[]
}
export const search = (query: string): Promise<SearchResponse> =>
  sendRequestToBackground('search', { query })

type GetCollectionsResponseTreeCollectionType = {
  id: string
  name: string
  parentId?: string
  children: GetCollectionsResponseTreeCollectionType[]
}
export type CollectionsTree = GetCollectionsResponseTreeCollectionType[]
export type CollectionObjectType = {
  id: string
  name: string
  parentId?: string
  childIds: string[]
}
export interface GetCollectionsResponse {
  collectionsTree: CollectionsTree
  collections: Record<string, CollectionObjectType>
}
export const getCollections = (): Promise<GetCollectionsResponse> =>
  sendRequestToBackground('getCollections')

export interface CreateCollectionItemResponse {
  success: boolean
  collection: {
    id: string
  }
  item: {
    id: string
  }
}

export const createCollectionItem = (
  text: string,
  cid?: string,
  cname?: string
): Promise<CreateCollectionItemResponse> =>
  sendRequestToBackground('createCollectionItem', {
    text,
    cid,
    cname,
  })

export type CollectionItemObjectType = {
  id: string
  text: string
  savedTime: Date
}
export interface GetCollectionItemsResponse {
  items: CollectionItemObjectType[]
}
export const getCollectionItems = (
  cid: string
): Promise<GetCollectionItemsResponse> =>
  sendRequestToBackground('getCollectionItems', {
    cid,
  })
