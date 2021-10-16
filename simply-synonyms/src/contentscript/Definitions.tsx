import browser from 'browserApi'
import Preact from 'preact'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { HiOutlineClipboardCopy } from '@react-icons/all-files/hi/HiOutlineClipboardCopy'
import { RiChatVoiceLine } from '@react-icons/all-files/ri/RiChatVoiceLine'
import api from '../api'
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink'
import { motion } from 'framer-motion'

const Definitions: Preact.FunctionComponent<{
  word: string
  onLoad: () => void
  animateDefinitions?: boolean
}> = ({ word, onLoad, animateDefinitions }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    homographs: {
      offensive: boolean
      pronunciation?: string
      audio?: string
      shortdefs: string[]
      functionalType: string
      word: string
      date: string
    }[]
  }>(null)

  const loadDictionaryData = async () => {
    setLoading(true)
    setData(null)

    const [wordDetailsRequestPromise, onUserCancelledRequest] =
      api.getWordDetails(word)

    const data = await wordDetailsRequestPromise.catch((err) => {
      toast.error(`Something went wrong and we couldn't fetch the definition`, {
        duration: 3000,
      })
    })

    setLoading(false)
    if (Array.isArray(data?.homographs)) setData(data)
    else setData({ homographs: [] })
  }

  useEffect(() => {
    loadDictionaryData()
  }, [word])

  // Trigger onLoad callback when data loads
  useEffect(() => {
    if (data) onLoad()
  }, [data])

  return (
    <>
      {loading && (
        <div class="word-details-loading">
          {/* <div class="folding-cube">
            <div class="cube1 sk-cube"></div>
            <div class="cube2 sk-cube"></div>
            <div class="cube4 sk-cube"></div>
            <div class="cube3 sk-cube"></div>
          </div> */}
          <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
          </div>
        </div>
      )}
      {data && (
        <div class="definitions">
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial={animateDefinitions && 'hidden'}
            animate="show"
          >
            {data.homographs.map((hg, hIndex) => (
              <motion.div
                key={hg.word}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  show: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                    },
                  },
                }}
              >
                <div class="homograph">
                  <h4 class="definition-label">
                    {/* <span class="index">{hIndex}. </span> */}
                    <span class="functional-type">{hg.functionalType}: </span>
                    <span class="word">{hg.word}</span>
                    <button
                      title="Copy word to clipboard"
                      onClick={async (e) => {
                        e.stopPropagation()
                        const withoutAsterisks = hg.word.replace(/\*/g, '')
                        await navigator.clipboard.writeText(withoutAsterisks)
                        toast.success(
                          `Copied "${withoutAsterisks}" to clipboard`
                        )
                      }}
                    >
                      <HiOutlineClipboardCopy size={16} />
                    </button>
                    {hg.pronunciation && (
                      <span class="pronunciation"> ({hg.pronunciation})</span>
                    )}
                    {hg.audio && (
                      <button
                        class="pronunciation"
                        onClick={(e) => {
                          e.stopPropagation()
                          browser.runtime.sendMessage(null, {
                            action: 'playAudio',
                            url: hg.audio,
                          })
                        }}
                      >
                        <RiChatVoiceLine size={18} />
                      </button>
                    )}
                  </h4>
                  {hg.offensive && (
                    <div class="offensive">(Potentially offensive)</div>
                  )}
                  {hg.shortdefs.map((def, defIndex) => (
                    <div class="definition" key={defIndex}>
                      {/* fromCharCode allows us to represent the index with letters: a, b, c... */}
                      <span class="muted">
                        {String.fromCharCode(97 + defIndex)}.{' '}
                      </span>
                      {def}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
          {!data.homographs?.length && (
            <div class="muted" style={{ margin: '10px 0' }}>
              No definitions found.
            </div>
          )}
          <button
            class="button flex-middle"
            onClick={(e) => {
              e.stopPropagation()
              browser.runtime.sendMessage(null, {
                action: 'doQuickSearch',
                word,
                searchDictionary: true,
              })
            }}
          >
            <span>Open dictionary&nbsp;</span>
            <FiExternalLink size={20} />
          </button>
        </div>
      )}
    </>
  )
}

export default Definitions