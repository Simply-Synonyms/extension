import React from 'preact'
import { forwardRef } from 'preact/compat'
import { useEffect, useState } from 'preact/hooks'
import { TargetType } from './App'
import { useSpring, animated } from 'react-spring'
import Definitions from './components/Definitions'
import AddWordToFavoritesButton from './components/AddWordToFavoritesButton'
import HomeTab from './tabs/HomeTab'
import LoadingSpinner from './components/LoadingSpinner'
import ThesaurusTabs from './tabs/ThesaurusTabs'
import WordDetailsOverlay from './components/WordDetailsOverlay'
import TextTab from './tabs/TextTab'
import SearchTab from './tabs/SearchTab'
import browser from 'browserApi'
import { AiFillHome } from '@react-icons/all-files/ai/AiFillHome'
import { AiOutlineSearch } from '@react-icons/all-files/ai/AiOutlineSearch'
import { initializeDataStore, useDataStore } from './datastore'
import { useAnimatedPosition } from './positioning'

const LOGO_URL = browser.runtime.getURL('/assets/logo.svg')

const AppPopup = forwardRef<
  HTMLDivElement,
  {
    text: string
    targetType: TargetType
    open: boolean | 'expand'
    position: [x: number, y: number] | null
    onClose: () => void
    replaceText: (t: string) => void
  }
>(
  (
    { text, position: clickPosition, open, onClose, targetType, replaceText },
    ref
  ) => {
    const word = text && text.includes(' ') ? null : text
    const phrase = text?.includes(' ') ? text : null

    initializeDataStore(text)

    const [expanded, setExpanded] = useState(false)

    type Tab =
      | 'synonyms'
      | 'antonyms'
      | 'definition'
      | 'phrase'
      | 'search'
      | 'home'
    const [tab, _setTab] = useState<Tab>('synonyms')

    const setTab = (tab: Tab) => {
      _setTab(tab)
      setExploringWord(null)
    }

    useEffect(() => {
      if (open) {
        _setTab('search')
        if (phrase) _setTab('phrase')
        if (word) _setTab(targetType ? 'synonyms' : 'definition')
      }
    }, [open])

    const [thesaurusData, thesaurusLoading] = useDataStore(
      (s) => s.entries[s.activeEntry].thesaurus
    )
    const loadThesaurus = useDataStore((s) => s.loadThesaurusData)

    useEffect(() => {
      if (word && expanded && tab !== 'definition' && !thesaurusData) {
        loadThesaurus()
      }
    }, [word, expanded, tab])

    const [exploringWord, setExploringWord] = useState<string | null>(null)

    const resetDatastore = useDataStore((s) => s.resetStore)
    const reset = () => {
      setExpanded(false)
      // setPosition(null)
      resetDatastore()
      setTab(targetType ? 'synonyms' : 'definition')
    }
    // Reset when popup closes
    useEffect(() => {
      if (!open) reset()
    }, [open])

    const [popupStyles, positionLoaded, reposition] = useAnimatedPosition(
      ref.current,
      !!open,
      clickPosition,
      expanded
    )

    /* Reposition when any of the following changes */
    useEffect(reposition, [open, expanded, ref.current, thesaurusData, tab])

    // Auto-expand popup when needed
    useEffect(() => {
      if (open === 'expand' && positionLoaded) setExpanded(true)
    }, [open, positionLoaded])

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
                <img src={LOGO_URL} class={'mini-logo'} />
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
                        class={tab === 'home' && 'active'}
                        onClick={() => setTab('home')}
                      >
                        <AiFillHome size={18} />
                      </button>
                      <button
                        class={tab === 'search' && 'active'}
                        onClick={() => setTab('search')}
                        style={{
                          strokeWidth: '2px',
                        }}
                      >
                        <AiOutlineSearch size={18} />
                      </button>
                      {phrase && (
                        <>
                          <button
                            class={tab === 'phrase' && 'active'}
                            onClick={() => setTab('phrase')}
                          >
                            Text
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
                        <AddWordToFavoritesButton word={word} />
                      </h2>
                      <Definitions word={word} onLoad={() => reposition()} />
                    </>
                  )}
                  {/* END word tabs */}

                  <WordDetailsOverlay
                    onClose={() => setExploringWord(null)}
                    onLoad={() => reposition()}
                    targetType={targetType}
                    word={exploringWord}
                    replaceText={replaceText}
                  />

                  {tab === 'home' && (
                    <HomeTab
                      onWordClick={(w) => setExploringWord(w)}
                      isExploringWord={!!exploringWord}
                    />
                  )}

                  {tab === 'phrase' && (
                    <TextTab
                      text={phrase}
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
