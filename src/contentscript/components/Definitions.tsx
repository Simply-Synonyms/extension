import browser from 'browserApi'
import Preact from 'preact'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { HiOutlineClipboardCopy } from '@react-icons/all-files/hi/HiOutlineClipboardCopy'
import { RiChatVoiceLine } from '@react-icons/all-files/ri/RiChatVoiceLine'
import { GetWordDataResponse, getWordData } from '../../api'
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import { useDataStore } from '../datastore'

const Definitions: Preact.FunctionComponent<{
  word: string
  onLoad: () => void
  animateDefinitions?: boolean
}> = ({ word, onLoad, animateDefinitions }) => {
  const [[data, loading], loadData] = useDataStore((s) => [
    s.entries[word]?.definition || [null],
    s.loadWordData,
  ])

  useEffect(() => {
    loadData(word)
  }, [])

  // Trigger onLoad callback when data loads
  useEffect(() => {
    if (data) onLoad()
  }, [data])

  return (
    <>
      {loading && !data && <LoadingSpinner />}
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
                        class="pronunciation bounce-button"
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
