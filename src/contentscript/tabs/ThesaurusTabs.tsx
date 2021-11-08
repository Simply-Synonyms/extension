import React from 'preact'
import { GetThesaurusDataResponse } from '../../api'
import Preact from 'preact'
import browser from 'browserApi'
import { useGlobalState } from '../state'

const ThesaurusTabs: Preact.FunctionComponent<{
  tab: 'synonyms' | 'antonyms'
  word: string
  thesaurusData: GetThesaurusDataResponse
}> = ({ tab, word, thesaurusData }) => {
  const noResults = !(
    tab === 'synonyms' ? thesaurusData?.synonyms : thesaurusData?.antonyms
  )?.length

  const [exploringWord, setExploringWord] = useGlobalState(s => [s.exploringWord, s.setExploringWord])

  return (
    <>
      <div>
        <h2 class={noResults && 'center'}>
          {!noResults ? 'Results for' : `No ${tab} found for`}
          <span class="primary-color"> {word}</span>
        </h2>
        {noResults && (
          <img src={browser.runtime.getURL('/assets/undraw_not_found.svg')} />
        )}
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
        </div>
      </div>
    </>
  )
}

export default ThesaurusTabs
