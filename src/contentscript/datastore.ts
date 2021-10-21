import toast from 'react-hot-toast'
import create from 'zustand'
import {
  favoriteWord,
  getThesaurusData,
  GetThesaurusDataResponse,
  getWordData,
  GetWordDataResponse,
} from '../api'

interface StoreDataType {
  text: string
  thesaurus: [data: GetThesaurusDataResponse, loading: boolean]
  definition: [data: GetWordDataResponse, loading: boolean]
  favoriteWords: { [word: string]: boolean }
}

const initialData: StoreDataType = {
  text: null,
  favoriteWords: {},
  thesaurus: [null, true],
  definition: [null, true],
}

// Error handler
const withToast = (t: string) => (err) => {
  toast.error(t)
}

export const useDataStore = create<
  StoreDataType & {
    resetStore: () => void
    loadThesaurusData: () => void
    loadWordData: () => void
    setFavorite: (word: string, favorite: boolean) => void
  }
>((set, get) => ({
  ...initialData,
  resetStore() {
    set(initialData)
  },
  setText(text: string) {
    get().resetStore()
    set({ text })
  },
  async loadThesaurusData() {
    const res = await getThesaurusData(get().text).catch(
      withToast(`Couldn't get thesaurus data`)
    )

    if (res) set({ thesaurus: [res, false] })
    else set({ thesaurus: [null, false] })
  },
  async loadWordData() {
    const res =
      (await getWordData(get().text).catch(
        withToast(`Couldn't get word data`)
      )) || null

    if (res && Array.isArray(res?.homographs)) set({ definition: [res, false] })
    else
      set({
        definition: [{ homographs: [], isFavorite: res?.isFavorite }, false],
      })

    if (res?.isFavorite !== undefined)
      set((d) => ({
        favoriteWords: { ...d.favoriteWords, [d.text]: res.isFavorite },
      }))
  },
  setFavorite (w, f) {
    set(d => ({
      favoriteWords: {...d.favoriteWords, [w]: f}
    }))
  }
}))
