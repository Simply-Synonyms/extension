import toast from 'react-hot-toast'
import create from 'zustand'
import {
  getFavoriteWords,
  getThesaurusData,
  GetThesaurusDataResponse,
  getWordData,
  GetWordDataResponse,
  CollectionsTree,
  getCollections,
  CollectionObjectType,
  CollectionItemObjectType,
  getCollectionItems,
} from '../api'
// TODO REMOVE DEVTOOLS FOR PROD
// import { devtools } from "zustand/middleware"

/** An entry represents a single word, phrase or other piece of text that can be associated with some thesaurus data, a definition, etc. */
interface EntryDataType {
  thesaurus: [data: GetThesaurusDataResponse, loading: boolean]
  definition: [data: GetWordDataResponse, loading: boolean]
  isFavorite: boolean
}

type CollectionDataType = CollectionObjectType & {
  items?: CollectionItemObjectType[]
}

export interface StoreDataType {
  /** The entry that is currently active in the popup */
  activeEntry: string
  entries: {
    [text: string]: EntryDataType
  }

  collections: {
    tree: CollectionsTree
    loading: boolean
    // Map of collection IDs and items
    data: Record<string, CollectionDataType>
  }
  // favoriteWords: { [word: string]: boolean }
}

const initialData: StoreDataType = {
  activeEntry: null,
  entries: {},
  collections: {
    tree: [],
    loading: true,
    data: {},
  },
}

const initialEntryData: EntryDataType = {
  thesaurus: [null, true],
  definition: [null, true],
  isFavorite: false,
}

// Error handler
const withToast = (t: string) => err => {
  toast.error(t)
}

/** Utility set function to make it easier to merge values into the currently active entry */
const mergeEntry =
  (o: Partial<EntryDataType> = {}, e?: string) =>
  (d: StoreDataType) => ({
    entries: {
      ...d.entries,
      [e || d.activeEntry]: {
        ...(d.entries[e || d.activeEntry] || initialEntryData),
        ...o,
      },
    },
  })

/** Utility set function to merge data about a single collection */
const mergeCollection =
  (o: Partial<CollectionDataType>, cid: string) => (d: StoreDataType) => ({
    collections: {
      ...d.collections,
      data: {
        ...d.collections.data,
        [cid]: {
          ...d.collections.data[cid],
          ...o,
        },
      },
    },
  })

export const useDataStore = create<
  StoreDataType & {
    // readonly thesaurus: [data: GetThesaurusDataResponse, loading: boolean]
    // readonly definition: [data: GetWordDataResponse, loading: boolean]
    // readonly favoriteWords: string[]
    resetStore: () => void
    setActiveText: (text: string) => void
    loadThesaurusData: () => void
    loadWordData: (word?: string) => Promise<void>
    setFavorite: (word: string, favorite: boolean) => void
    getFavorites: () => Promise<void>
    loadCollections: () => Promise<void>
    loadCollectionItems: (collectionId: string) => Promise<void>
  }
>((set, get) => ({
  ...initialData,
  /** Clear all entries from the store */
  resetStore() {
    set(initialData)
  },
  setActiveText(t) {
    set(d => ({
      activeEntry: t,
      ...mergeEntry({}, t),
    }))
  },
  async loadThesaurusData() {
    const res = await getThesaurusData(get().activeEntry).catch(
      withToast(`Couldn't get thesaurus data for that word`)
    )

    if (res)
      set(
        mergeEntry({
          thesaurus: [res, false],
        })
      )
    else set(mergeEntry({ thesaurus: [null, false] }))
  },
  /** Loads definition and other word data for the active entry */
  async loadWordData(word) {
    const w = word || get().activeEntry
    set(mergeEntry({}, w))

    const res =
      (await getWordData(w).catch(withToast(`Couldn't get word data`))) || null

    if (res && Array.isArray(res?.homographs))
      set(
        mergeEntry({ definition: [res, false], isFavorite: res.isFavorite }, w)
      )
    else if (!get().entries[w].definition[0])
      set(
        mergeEntry(
          {
            definition: [
              { homographs: [], isFavorite: res?.isFavorite },
              false,
            ],
            isFavorite: res.isFavorite,
          },
          w
        )
      )
  },
  /** Update the favorite status of a word in the store (does NOT call API) */
  setFavorite(w, f) {
    set(
      mergeEntry(
        {
          isFavorite: f,
        },
        w
      )
    )
  },
  /** Gets the list of favorite words and updates each associated entry */
  async getFavorites() {
    const res = await getFavoriteWords().catch(
      withToast(`Couldn't find your favorite words`)
    )

    if (res) {
      // Map favorites to an object of entries that are merged with any preexisting entries
      set(d => ({
        entries: {
          ...d.entries,
          ...Object.fromEntries(
            res.favoriteWords.map(w => [
              w.word,
              {
                ...(d.entries[w.word] || initialEntryData),
                isFavorite: true,
              },
            ])
          ),
        },
      }))
    }
  },
  /** Loads the tree array of collection IDs and names */
  async loadCollections() {
    const res = await getCollections().catch(
      withToast(`We couldn't find the list of your collections.`)
    )

    set(d => ({
      collections: {
        ...d.collections,
        loading: false,
        tree: res ? res.collectionsTree : null,
        data: res ? res.collections : null,
      },
    }))
  },
  /** Load the items of a single collection */
  async loadCollectionItems(cid) {
    const res = await getCollectionItems(cid).catch(
      withToast(`Error loading that collection`)
    )

    set(
      mergeCollection(
        {
          items: res ? res.items : [],
        },
        cid
      )
    )
  },
}))

export const initializeDataStore = (text: string) => {
  const state = useDataStore.getState()
  if (!state.entries[text])
    useDataStore.setState({
      activeEntry: text,
      entries: {
        [text]: initialEntryData,
      },
    })
}
