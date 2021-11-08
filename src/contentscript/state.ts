import create from 'zustand'

/** Seperate application state store type */
export interface AppStateType {
  exploringWord: string | null
  _triggerRepositionCounter: number
}

const initialState: AppStateType = {
  exploringWord: null,
  _triggerRepositionCounter: 0,
}

/** Access store for global app state */
export const useGlobalState = create<
  AppStateType & {
    setExploringWord: (word: string) => void
    triggerReposition: () => void
  }
>((set, get) => ({
  ...initialState,
  setExploringWord(exploringWord) {
    set({ exploringWord })
  },
  triggerReposition() {
    // Very hacky way to trigger repositions from Popup.tsx using an effect hook.
    // TODO Do this a better way
    set(s => ({ _triggerRepositionCounter: s._triggerRepositionCounter + 1 }))
  },
}))
