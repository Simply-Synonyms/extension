import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft'
import { HiOutlineClipboardCopy } from '@react-icons/all-files/hi/HiOutlineClipboardCopy'
import { AnimatePresence, motion } from 'framer-motion'
import Preact from 'preact'
import toast from 'react-hot-toast'
import { TargetType } from '../App'
import AddWordToFavoritesButton from './AddWordToFavoritesButton'
import Definitions from './Definitions'

const WordDetailsOverlay: Preact.FunctionComponent<{
  word: string
  targetType: TargetType
  targetEl: HTMLElement
  favoriteWords: Record<string, boolean>
  onLoad: () => void
  onFavoriteChange: (f: boolean) => void
  onClose: (closePopup?: boolean) => void
}> = ({
  word,
  onClose,
  targetType,
  targetEl,
  onFavoriteChange,
  favoriteWords,
  onLoad,
}) => {
  const replaceWord = (newWord: string) => {
    switch (targetType) {
      case 'input':
        const el = targetEl as HTMLInputElement
        // Replace input text with a new string containing the new word
        el.value =
          el.value.slice(0, el.selectionStart) +
          newWord +
          el.value.slice(el.selectionEnd)
        break
      case 'gdoc':
        // Replace selected word by typing out letters in new word
        // for (let i = 0; i < wordChosen.length; i++) {
        //   sendPageInterfaceMessage('simulateGoogleDocKeypress', {
        //     key: wordChosen[i],
        //   })
        // }
        break
    }
  }

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="word-details"
        >
          <div class="top">
            <a
              class="back"
              onClick={(e) => {
                onClose()
                e.stopPropagation()
              }}
            >
              <FiChevronLeft size={18} />
              <span>Back to words</span>
            </a>
            <div class="space"></div>
            {targetType && (
              <div>
                <button
                  class="button"
                  onClick={(e) => {
                    replaceWord(word)
                    onClose(true)
                  }}
                >
                  Replace word
                </button>
              </div>
            )}
          </div>

          <h2 class="flex-middle">
            <span>{word}</span>
            <button
              class="bounce-button"
              title="Copy word to clipboard"
              onClick={async (e) => {
                e.stopPropagation()
                await navigator.clipboard.writeText(word)
                toast.success(`Copied "${word}" to clipboard`)
              }}
            >
              <HiOutlineClipboardCopy size={20} />
            </button>
            <AddWordToFavoritesButton
              onChange={onFavoriteChange}
              word={word}
              favorites={favoriteWords}
            />
          </h2>
          <h6>Definitions</h6>
          <Definitions
            animateDefinitions
            word={word}
            onLoad={onLoad}
            setIsFavorite={(f) => (favoriteWords[word] = f)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WordDetailsOverlay
