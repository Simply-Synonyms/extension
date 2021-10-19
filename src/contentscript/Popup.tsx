import { forwardRef } from 'preact/compat'
import {
  GetThesaurusDataResponse,
  getThesaurusData,
  favoriteWord,
} from '../api'
import { useEffect, useState } from 'preact/hooks'
import { TargetType } from './App'
import { LoaderIcon, toast } from 'react-hot-toast'
import { useSpring, animated } from 'react-spring'
import Definitions from './components/Definitions'
import AddWordToFavoritesButton from './components/AddWordToFavoritesButton'
import MoreTab from './tabs/MoreTab'
import LoadingSpinner from './components/LoadingSpinner'
import ThesaurusTabs from './tabs/ThesaurusTabs'
import WordDetailsOverlay from './components/WordDetailsOverlay'
import PhraseTab from './tabs/PhraseTab'
import SearchTab from './tabs/SearchTab'
import { useApiRequest } from '../lib/hooks'

// Minimum spacing between popup and edges of window
const WINDOW_MARGIN = 20
// Horizontal spacing between target and popup when adjusting position
const TARGET_MARGIN = 50

// Initial vertical spacing between target and top of popup
const TARGET_VERTICAL_PADDING = 20

const POPUP_WIDTH = 350
const MIN_POPUP_HEIGHT = 300

const AppPopup = forwardRef<
  HTMLDivElement,
  {
    text: string
    targetType: TargetType
    targetEl: HTMLElement
    open: boolean | 'expand'
    position: [x: number, y: number] | null
    onClose: () => void
  }
>(
  (
    { text, position: initialPosition, open, onClose, targetType, targetEl },
    ref
  ) => {
    const word = text && text.includes(' ') ? null : text
    const phrase = text?.includes(' ') ? text : null

    const [expanded, setExpanded] = useState(false)

    type Tab =
      | 'synonyms'
      | 'antonyms'
      | 'definition'
      | 'phrase'
      | 'search'
      | 'more'
    const [tab, _setTab] = useState<Tab>('synonyms')

    const setTab = (tab: Tab) => {
      _setTab(tab)
      setExploringWord(null)
    }

    useEffect(() => {
      if (open) {
        _setTab('search')
        if (phrase && targetType) _setTab('phrase')
        if (word) _setTab(targetType ? 'synonyms' : 'definition')
      }
    }, [open])

    // const [thesaurusLoading, setThesaurusLoading] = useState(true)
    // const [thesaurusData, setThesaurusData] =
    //   useState<GetThesaurusDataResponse>(null)

    const [thesaurusData, thesaurusLoading, loadThesaurus, resetThesaurus] =
      useApiRequest<GetThesaurusDataResponse>(
        () => getThesaurusData(word),
        `We couldn't reach our servers. Please try again.`
      )

    useEffect(() => {
      if (word && expanded && tab !== 'definition' && !thesaurusData) {
        loadThesaurus()
      }
    }, [word, expanded, tab])

    const [exploringWord, setExploringWord] = useState<string | null>(null)

    const [position, setPosition] = useState(null)

    const reset = () => {
      setExpanded(false)
      setPosition(null)
      resetThesaurus()
      setTab(targetType ? 'synonyms' : 'definition')
    }

    // TODO figure out this positioning nightmare
    // alert(position &&
    //   initialPosition[0] + POPUP_WIDTH <= window.innerWidth - WINDOW_MARGIN &&
    //   Math.max(WINDOW_MARGIN, position[0]))

    /* Animated popup positioning */
    const popupStyles = useSpring({
      immediate: !open,
      config: {
        tension: 300,
      },
      left: `${
        position &&
        // initialPosition[0] + POPUP_WIDTH <= window.innerWidth - WINDOW_MARGIN &&
        Math.max(WINDOW_MARGIN, position[0])
      }px`,
      // right: `${
      //   position &&
      //   initialPosition[0] + POPUP_WIDTH > window.innerWidth - WINDOW_MARGIN &&
      //   window.innerWidth -
      //     position[0] -
      //     (expanded ? POPUP_WIDTH : (ref.current?.offsetWidth))
      // }px`,
      top: `${
        position &&
        initialPosition[1] + MIN_POPUP_HEIGHT <=
          window.innerHeight - WINDOW_MARGIN &&
        Math.max(WINDOW_MARGIN, position[1])
      }px`,
      bottom: `${
        position &&
        initialPosition[1] + MIN_POPUP_HEIGHT >
          window.innerHeight - WINDOW_MARGIN &&
        Math.max(
          WINDOW_MARGIN,
          window.innerHeight - position[1] - ref.current.scrollHeight
        )
      }px`,
      height: expanded
        ? Math.min(
            Math.max(MIN_POPUP_HEIGHT, ref.current.scrollHeight),
            window.innerHeight - WINDOW_MARGIN * 2
          ) + 'px'
        : '30px',
      width: expanded ? POPUP_WIDTH + 'px' : '150px',
    })

    /* Automatic repositioning */
    const reposition = () => {
      // Ensure that the popup doesn't overlap the target position, or the margin around the edge of the window
      if (ref.current && open) {
        const el = ref.current

        // If there isn't room at bottom of window, move popup above target
        const above =
          initialPosition[1] + el.scrollHeight + TARGET_VERTICAL_PADDING >
          window.innerHeight - WINDOW_MARGIN
        let newY = above
          ? (expanded
              ? window.innerHeight - WINDOW_MARGIN
              : initialPosition[1] - TARGET_VERTICAL_PADDING) - el.scrollHeight
          : initialPosition[1] + TARGET_VERTICAL_PADDING

        // If there isn't room at right side of window, move popup to left of target
        const atLeft =
          initialPosition[0] + POPUP_WIDTH + TARGET_MARGIN >
          window.innerWidth - WINDOW_MARGIN
        let newX = atLeft
          ? initialPosition[0] - (expanded ? POPUP_WIDTH : el.scrollWidth)
          : initialPosition[0]

        if (expanded && initialPosition[1] + TARGET_VERTICAL_PADDING > newY) {
          // Move left/right to leave horizontal spacing between target and edge of popup if needed
          newX += atLeft ? -TARGET_MARGIN : TARGET_MARGIN
        }

        // If it's collapsed center it under the target
        if (!expanded) newX += atLeft ? el.offsetWidth / 2 : -el.offsetWidth / 2

        // Clamp values at top and left:
        setPosition([
          Math.max(WINDOW_MARGIN, newX),
          Math.max(WINDOW_MARGIN, newY),
        ])
      }
    }

    /* Reposition when any of the following changes */
    useEffect(reposition, [open, expanded, ref.current, thesaurusData, tab])

    // Reset when popup closes
    useEffect(() => {
      if (!open) reset()
    }, [open])

    // Auto-expand popup when needed
    useEffect(() => {
      if (open === 'expand' && position) setExpanded(true)
    }, [open, position])

    useEffect(() => {
      const func = (e) => {
        // If popup isn't expanded, always close when a key is pressed
        if (!expanded || e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', func)
      // On cleanup remove the listener
      return () => {
        document.removeEventListener('keydown', func)
      }
    }, [expanded])

    const updateLoadingStatus = async () => {
      // await waitMs(2000)
      // setLoadingStatus('Trying to reach our servers...')
      // await waitMs(4000)
      // setLoadingStatus('This is taking longer than usual...')
      // await waitMs(10000)
      // setLoadingStatus(`We're having trouble getting a response. Please try again.`)
    }

    const replaceText = (newWord: string) => {
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
      onClose()
    }

    const [favoriteWords, setFavoriteWords] = useState<Record<string, boolean>>(
      {}
    )

    const isThesaurusTab = tab === 'synonyms' || tab === 'antonyms'

    return (
      <>
        {open && (
          <animated.div
            ref={ref}
            id="ssyne-popup"
            style={popupStyles}
            class={expanded ? 'expanded' : 'collapsed'}
          >
            {!expanded && (
              <button
                class="popup-expand-button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(true)
                }}
              >
                Simply Synonyms
              </button>
            )}
            {expanded && (
              <>
                <div class="controls">
                  <button class="close" onClick={() => onClose()}>
                    close
                  </button>
                  {
                    <div class="tabs">
                      {phrase && targetType && (
                        <>
                          <button
                            class={tab === 'phrase' && 'active'}
                            onClick={() => setTab('phrase')}
                          >
                            Phrase
                          </button>
                        </>
                      )}
                      {!word && (
                        <>
                          <button
                            class={tab === 'search' && 'active'}
                            onClick={() => setTab('search')}
                          >
                            Search
                          </button>
                        </>
                      )}
                      {word && (
                        <>
                          <button
                            class={tab === 'synonyms' && 'active'}
                            onClick={() => setTab('synonyms')}
                          >
                            Synonyms
                          </button>
                          <button
                            class={tab === 'antonyms' && 'active'}
                            onClick={() => setTab('antonyms')}
                          >
                            Antonyms
                          </button>
                          <button
                            class={tab === 'definition' && 'active'}
                            onClick={() => setTab('definition')}
                          >
                            Definition
                          </button>
                        </>
                      )}
                      {targetType && (
                        <button
                          class={tab === 'more' && 'active'}
                          onClick={() => setTab('more')}
                        >
                          My words
                        </button>
                      )}
                    </div>
                  }
                </div>

                {isThesaurusTab && thesaurusLoading && <LoadingSpinner />}

                <div class="content">
                  {/* Word tabs */}
                  {thesaurusData && isThesaurusTab && (
                    <ThesaurusTabs
                      tab={tab}
                      thesaurusData={thesaurusData}
                      word={word}
                      onClickWord={setExploringWord}
                    />
                  )}

                  {tab === 'definition' && (
                    <>
                      <h2 class="flex-middle">
                        <span>{word}</span>
                        <AddWordToFavoritesButton
                          onChange={(f) =>
                            setFavoriteWords((favs) => ({
                              ...favs,
                              [word]: f,
                            }))
                          }
                          word={word}
                          favorites={favoriteWords}
                        />
                      </h2>
                      <Definitions
                        word={word}
                        onLoad={() => reposition()}
                        setIsFavorite={(f) => (favoriteWords[word] = f)}
                      />
                    </>
                  )}
                  {/* END word tabs */}

                  <WordDetailsOverlay
                    favoriteWords={favoriteWords}
                    onFavoriteChange={(f) => {
                      setFavoriteWords((favs) => ({
                        ...favs,
                        [exploringWord]: f,
                      }))
                    }}
                    onClose={() => setExploringWord(null)}
                    onLoad={() => reposition()}
                    targetEl={targetEl}
                    targetType={targetType}
                    word={exploringWord}
                    replaceText={replaceText}
                  />

                  {tab === 'more' && (
                    <MoreTab
                      onWordClick={(w) => setExploringWord(w)}
                      isExploringWord={!!exploringWord}
                    />
                  )}

                  {tab === 'phrase' && (
                    <PhraseTab
                      phrase={phrase}
                      onLoad={() => reposition()}
                      replaceText={replaceText}
                    />
                  )}

                  {tab === 'search' && <SearchTab />}
                </div>
                {/* End content div */}
              </>
            )}
          </animated.div>
        )}
      </>
    )
  }
)

export default AppPopup
