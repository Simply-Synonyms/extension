import toast from 'react-hot-toast'
import create from 'zustand'
import {
  getFavoriteWords,
  getThesaurusData,
  GetThesaurusDataResponse,
  getWordData,
  GetWordDataResponse,
} from '../api'

/** An entry represents a single word, phrase or other piece of text that can be associated with some thesaurus data, a definition, etc. */
interface EntryDataType {
  thesaurus: [data: GetThesaurusDataResponse, loading: boolean]
  definition: [data: GetWordDataResponse, loading: boolean]
  isFavorite: boolean
}

interface StoreDataType {
  /** The entry that is currently active in the popup */
  activeEntry: string
  entries: {
    [text: string]: EntryDataType
  }

  // favoriteWords: { [word: string]: boolean }
}

const initialData: StoreDataType = {
  activeEntry: null,
  entries: {},
}

const initialEntryData: EntryDataType = {
  thesaurus: [null, true],
  definition: [null, true],
  isFavorite: false,
}

// Error handler
const withToast = (t: string) => (err) => {
  toast.error(t)
}

/** Utility set function to make it easier to merge values into the currently active entry */
const mergeEntry =
  (o: Partial<EntryDataType>, e?: string) => (d: StoreDataType) => ({
    entries: {
      ...d.entries,
      [e || d.activeEntry]: { ...(d.entries[e || d.activeEntry] || initialEntryData), ...o },
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
    loadWordData: () => void
    setFavorite: (word: string, favorite: boolean) => void
    getFavorites: () => Promise<void>
  }
>((set, get) => ({
  ...initialData,
  /** Clear all entries from the store */
  resetStore() {
    set(initialData)
  },
  setActiveText(t) {
    set((d) => ({
      activeEntry: t,
      entries: {
        ...d.entries,
        [t]: d.entries[t] ? undefined : initialEntryData,
      },
    }))
  },
  // get thesaurus () {
  //   return get()?.entries[get().activeEntry].thesaurus
  // },
  // get definition () {
  //   return get()?.entries[get().activeEntry].definition
  // },
  /** Filter entries to find those marked as a favorite, then return array of their texts */
  // get favoriteWords () {
  //   return Object.entries(get().entries).filter(([_, e]) => e.isFavorite).map(([t]) => t)
  // },
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
  async loadWordData() {
    const res =
      (await getWordData(get().activeEntry).catch(
        withToast(`Couldn't get word data`)
      )) || null

    if (res && Array.isArray(res?.homographs))
      set(mergeEntry({ definition: [res, false], isFavorite: res.isFavorite }))
    else
      set(
        mergeEntry({
          definition: [{ homographs: [], isFavorite: res?.isFavorite }, false],
          isFavorite: res.isFavorite
        })
      )
  },
  setFavorite(w, f) {
    set(
      mergeEntry({
          isFavorite: f,
        }, w)
    )
  },
  async getFavorites() {
    const res = await getFavoriteWords().catch(
      withToast(`Couldn't find your favorite words`)
    )

    if (res) {
      // Map favorites to an object of entries that are merged with any preexisting entries
      // const updatedEntries: StoreDataType['entries'] =

      // console.log(updatedEntries)
      // TODO check merge
      set((d) => ({
        entries: {
          ...d.entries,
          ...Object.fromEntries(
            res.favoriteWords.map((w) => [
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
    // set({ favoritesLoading: false })
  },
}))

export const initializeDataStore = (text: string) => {
  useDataStore.setState({
    activeEntry: text,
    entries: {
      [text]: initialEntryData,
    },
  })
}
