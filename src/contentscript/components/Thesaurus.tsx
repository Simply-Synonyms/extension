import React from 'preact'
import { useGlobalState } from '../state'
import { useDataStore } from '../datastore'
import { useEffect } from 'preact/hooks'

const Thesaurus: React.FunctionComponent<{
  word: string
  show: 'synonyms' | 'antonyms'
  onLoad: () => void
}> = ({ word, show }) => {
  const [thesaurusData, thesaurusLoading] = useDataStore(
    s => s.entries[s.activeEntry].thesaurus
  )
  const loadThesaurus = useDataStore(s => s.loadThesaurusData)
  const [exploringWord, setExploringWord] = useGlobalState(s => [s.exploringWord, s.setExploringWord])

  useEffect(() => {
    if (!thesaurusData) loadThesaurus()
  }, [])

  return (
    <>
      {(show === 'synonyms'
        ? thesaurusData.synonyms
        : thesaurusData.antonyms
      )?.map((wordGroup, groupIndex) => (
        <div>
          <h4 className="word-group-label">
            <span class="muted">{groupIndex + 1}. </span>
            {thesaurusData.shortdefs[groupIndex]}
          </h4>
          {wordGroup.map(w => (
            <div class="container">
              <span
                class="word"
                onClick={e => {
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
    </>
  )
}
