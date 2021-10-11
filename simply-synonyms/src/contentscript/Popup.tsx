import { forwardRef } from 'preact/compat'
import api from '../api'
import {
  sendPageInterfaceMessage,
  onPageInterfaceMessage,
} from './embeddedScriptInterface'
import { useEffect, useState } from 'preact/hooks'
import { waitMs } from '../lib/util'
import { FiChevronLeft } from 'react-icons/fi'
import { TargetType } from './App'
import { toast } from 'react-hot-toast'
import { HiOutlineClipboardCopy } from 'react-icons/hi'

// Minimum spacing between popup and edges of window
const WINDOW_MARGIN = 20
// Horizontal spacing between target and popup when adjusting position
const TARGET_MARGIN = 50

const AppPopup = forwardRef<
  HTMLDivElement,
  {
    word: string
    targetType: TargetType
    open: boolean
    position: [x: number, y: number] | null
    onClose: () => void
  }
>(({ word, position: initialPosition, open, onClose, targetType }, ref) => {
  const [exploringWord, setExploringWord] = useState<string | null>(null)

  type Tab = 'synonyms' | 'antonyms' | 'definition'
  const [tab, _setTab] = useState<Tab>('synonyms')

  const setTab = (tab: Tab) => {
    _setTab(tab)
    setExploringWord(null)
  }

  const [loading, setLoading] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [thesaurusData, setThesaurusData] = useState<{
    shortdefs: string[]
    synonyms: string[][]
    antonyms: string[][]
  }>(null)

  const [position, setPosition] = useState(null)

  const reset = () => {
    setPosition(null)
    setLoading(true)
    setTab('synonyms')
    setExploringWord(null)
    setThesaurusData(null)
  }

  useEffect(() => {
    if (ref.current && open) {
      // Ensure that the popup doesn't overlap the target position, or the margin around the edge of the window
      const el = ref.current
      const pos = initialPosition
      // Make sure there's room for the popup at bottom of window
      const newY = Math.max(
        WINDOW_MARGIN,
        Math.min(pos[1], window.innerHeight - WINDOW_MARGIN - el.offsetHeight)
      )
      setPosition(
        // If there isn't room at right side of window, move popup to left of target
        pos[0] + el.offsetWidth >
          window.innerWidth - WINDOW_MARGIN - TARGET_MARGIN
          ? [pos[0] - el.offsetWidth - TARGET_MARGIN, newY]
          : [
              // If the new top position is above target, move to right to ensure that target is visible
              newY < pos[1] ? pos[0] + TARGET_MARGIN : pos[0],
              newY,
            ]
      )
    }

    if (!open) reset()
  }, [open, ref.current, thesaurusData, tab])

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

    const data = await synonymRequestPromise

    setThesaurusData(data)
    setLoading(false)
  }

  useEffect(() => {
    if (word && open) {
      loadThesaurus()
    }
  }, [word, open])

  // synonymRequestPromise
  //   .then((response) => {
  //     if (response.synonyms) {
  //       // TODO Click callback for contenteditable and gdoc
  //       const onChooseReplacementWord =
  //         targetType !== 'input' && targetType !== 'gdoc'
  //           ? null
  //           : (wordChosen) => {
  //               switch (targetType) {
  //                 case 'input':
  //                   // Replace input text with a new string containing the chosen word
  //                   e.target.value =
  //                     e.target.value.slice(0, e.target.selectionStart) +
  //                     wordChosen +
  //                     e.target.value.slice(e.target.selectionEnd)
  //                   break
  //                 case 'gdoc':
  //                   // Replace selected word by typing out letters in new word
  //                   for (let i = 0; i < wordChosen.length; i++) {
  //                     sendPageInterfaceMessage('simulateGoogleDocKeypress', {
  //                       key: wordChosen[i],
  //                     })
  //                   }
  //               }
  //               resetPopup()
  //             }
  //       addWordsToPopup(
  //         'synonyms',
  //         response.shortdefs,
  //         response.synonyms,
  //         onChooseReplacementWord
  //       )
  //       addWordsToPopup(
  //         'antonyms',
  //         response.shortdefs,
  //         response.antonyms || [],
  //         onChooseReplacementWord
  //       )
  //     } else {
  //       const suffixText = targetType
  //         ? 'Are you sure you spelled it correctly?'
  //         : '' // Only show this text if the target is editable
  //       setResultsText(`Unable to find synonyms for "${word}". ${suffixText}`)
  //     }
  //   })
  //   .catch((err) => {
  //     console.error(err)
  //     setResultsText(
  //       `An error occurred and we couldn't reach our servers. Please try again later.`
  //     )
  //   })
  //   .finally(() => {
  //     stopLoading()
  //   })

  return (
    <>
      {open && (
        <div
          ref={ref}
          id="ssyne-popup"
          style={{
            // display: open ? 'block' : 'none',
            left: `${position && Math.max(WINDOW_MARGIN, position[0])}px`,
            top: `${position && Math.max(WINDOW_MARGIN, position[1])}px`,
            maxHeight: `${window.innerHeight - WINDOW_MARGIN * 2}px`,
          }}
        >
          <div class="controls">
            <button class="close" onClick={() => onClose()}>
              close
            </button>
            {!loading && (
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
            )}
          </div>

          {loading && (
            <div class="loading">
              <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
              </div>
              <p class="connecting-text">{loadingStatus}</p>
            </div>
          )}

          <div class="content">
            {thesaurusData && (
              <>
                {!exploringWord && (
                  <div>
                    <h3 class="results-text">
                      {(tab === 'synonyms'
                        ? thesaurusData.synonyms
                        : thesaurusData.antonyms
                      )?.length
                        ? 'Results for'
                        : `No ${tab} found for`}
                      <span class="primary-color"> {word}</span>
                    </h3>
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
                          {wordGroup.map((word) => (
                            <div class="container">
                              <span
                                class="word"
                                onClick={(e) => {
                                  setExploringWord(word)
                                  e.stopPropagation()
                                }}
                              >
                                {word}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exploringWord && (
                  <div class="word-details">
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
                          <button class="button">Use this word</button>
                        </div>
                      )}
                    </div>

                    <h2 class="flex-middle">
                      <span>{exploringWord}</span>
                      <button onClick={async (e) => {
                        e.stopPropagation()
                        await navigator.clipboard.writeText(exploringWord)
                        toast.success(`Copied "${exploringWord}" to clipboard`)
                      }}><HiOutlineClipboardCopy size={20}/></button>
                    </h2>
                    <h6>definition</h6>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
})

export default AppPopup
