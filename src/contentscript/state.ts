import create from 'zustand'

/** Seperate application state store type */
export interface AppStateType {
  exploringWord: string | null
}

const initialState = {
  exploringWord: null,
}

/** Access store for global app state */
export const useGlobalState = create<
  AppStateType & {
    setExploringWord: (word: string) => void
  }
>((set, get) => ({
  ...initialState,
  setExploringWord(exploringWord) {
    set({ exploringWord })
  },
}))
