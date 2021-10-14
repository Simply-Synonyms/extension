import { forwardRef } from 'preact/compat'
import api from '../api'
import { useEffect, useState } from 'preact/hooks'
import { waitMs } from '../lib/util'
import { TargetType } from './App'
import { toast } from 'react-hot-toast'
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft'
import { HiOutlineClipboardCopy } from '@react-icons/all-files/hi/HiOutlineClipboardCopy'
import { useSpring, animated } from 'react-spring'
import Definitions from './Definitions'
import { motion, AnimatePresence } from 'framer-motion'
import browser from 'browserApi'

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
    word: string
    targetType: TargetType
    targetEl: HTMLElement
    open: boolean
    position: [x: number, y: number] | null
    onClose: () => void
  }
>(
  (
    { word, position: initialPosition, open, onClose, targetType, targetEl },
    ref
  ) => {
    const [expanded, setExpanded] = useState(false)

    type Tab = 'synonyms' | 'antonyms' | 'definition'
    const [tab, _setTab] = useState<Tab>('synonyms')

    const setTab = (tab: Tab) => {
      _setTab(tab)
      setExploringWord(null)
    }

    useEffect(
      () => _setTab(targetType ? 'synonyms' : 'definition'),
      [targetType]
    )

    const [thesaurusLoading, setThesaurusLoading] = useState(true)
    const [loadingStatus, setLoadingStatus] = useState('')
    const [thesaurusData, setThesaurusData] = useState<{
      shortdefs: string[]
      synonyms: string[][]
      antonyms: string[][]
    }>(null)

    const [exploringWord, setExploringWord] = useState<string | null>(null)

    const [position, setPosition] = useState(null)

    const reset = () => {
      setExpanded(false)
      setPosition(null)
      setThesaurusLoading(true)
      setTab(targetType ? 'synonyms' : 'definition')
      setThesaurusData(null)
    }

    /* Animated popup positioning */
    const popupStyles = useSpring({
      immediate: !open,
      config: {
        tension: 300,
      },
      left: `${
        position &&
        initialPosition[0] + POPUP_WIDTH <= window.innerWidth - WINDOW_MARGIN &&
        Math.max(WINDOW_MARGIN, position[0])
      }px`,
      right: `${
        position &&
        initialPosition[0] + POPUP_WIDTH > window.innerWidth - WINDOW_MARGIN &&
        window.innerWidth -
          position[0] -
          (expanded ? POPUP_WIDTH : ref.current.offsetWidth)
      }px`,
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

    useEffect(() => {
      if (!open) reset()
    }, [open])

    useEffect(() => {
      const func = (e) => {
        // If popup isn't expanded, always close when a key is pressed
        if (!expanded || e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', func)
      return () => {
        // On cleanup remove the listener
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

    const loadThesaurus = async () => {
      const [synonymRequestPromise, onUserCancelledRequest] =
        api.getSynonyms(word)

      updateLoadingStatus()

      const data = await synonymRequestPromise.catch((err) => {
        toast.error(`We couldn't reach our servers. Please try again.`, {
          duration: 4000,
        })
        onClose()
      })

      setThesaurusData(data)
      setThesaurusLoading(false)
    }

    useEffect(() => {
      if (word && expanded && tab !== 'definition' && !thesaurusData) {
        loadThesaurus()
      }
    }, [word, expanded, tab])

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

    const noResults = !(
      tab === 'synonyms' ? thesaurusData?.synonyms : thesaurusData?.antonyms
    )?.length

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
                    </div>
                  }
                </div>

                {tab !== 'definition' && thesaurusLoading && (
                  <div class="loading">
                    <div class="spinner">
                      <div class="double-bounce1"></div>
                      <div class="double-bounce2"></div>
                    </div>
                    <p class="connecting-text">{loadingStatus}</p>
                  </div>
                )}

                <div class="content">
                  {thesaurusData && tab !== 'definition' && (
                    <>
                      {!exploringWord && (
                        <div>
                          <h2 class={noResults && 'center'}>
                            {!noResults ? 'Results for' : `No ${tab} found for`}
                            <span class="primary-color"> {word}</span>
                          </h2>
                          {noResults && <img src={browser.runtime.getURL('/assets/undraw_not_found.svg')} />}
                          <div class="words">
                            {(tab === 'synonyms'
                              ? thesaurusData.synonyms
                              : thesaurusData.antonyms
                            )?.map((wordGroup, groupIndex) => (
                              <div>
                                <h4 className="word-group-label">
                                  <span class="muted">{groupIndex + 1}. </span>
                                  {thesaurusData.shortdefs[groupIndex]}
                                </h4>
                                {wordGroup.map((w) => (
                                  <div class="container">
                                    <span
                                      class="word"
                                      onClick={(e) => {
                                        setExploringWord(w)
                                        e.stopPropagation()
                                      }}
                                    >
                                      {w}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <AnimatePresence>
                        {exploringWord && (
                          <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            class="word-details"
                            style={{
                              position: 'absolute',
                              top: 0,
                              width: '100%',
                            }}
                          >
                            <div class="top">
                              <a
                                class="back"
                                onClick={(e) => {
                                  setExploringWord(null)
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
                                      replaceWord(exploringWord)
                                      onClose()
                                    }}
                                  >
                                    Replace word
                                  </button>
                                </div>
                              )}
                            </div>

                            <h2 class="flex-middle">
                              <span>{exploringWord}</span>
                              <button
                                title="Copy word to clipboard"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await navigator.clipboard.writeText(
                                    exploringWord
                                  )
                                  toast.success(
                                    `Copied "${exploringWord}" to clipboard`
                                  )
                                }}
                              >
                                <HiOutlineClipboardCopy size={20} />
                              </button>
                            </h2>
                            <h6>Definitions</h6>
                            <Definitions
                              animateDefinitions
                              word={exploringWord}
                              onLoad={() => reposition()}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                  {tab === 'definition' && (
                    <>
                      <h2>{word}</h2>
                      <Definitions word={word} onLoad={() => reposition()} />
                    </>
                  )}
                </div>
              </>
            )}
          </animated.div>
        )}
      </>
    )
  }
)

export default AppPopup
