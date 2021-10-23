import React from 'preact'
import { GetThesaurusDataResponse } from '../../api'
import Preact from 'preact'
import browser from 'browserApi'

const ThesaurusTabs: Preact.FunctionComponent<{
  tab: 'synonyms' | 'antonyms'
  word: string
  thesaurusData: GetThesaurusDataResponse
  onClickWord: (w: string) => void
}> = ({ tab, word, thesaurusData, onClickWord }) => {
  const noResults = !(
    tab === 'synonyms' ? thesaurusData?.synonyms : thesaurusData?.antonyms
  )?.length

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
              {wordGroup.map((w) => (
                <div class="container">
                  <span
                    class="word"
                    onClick={(e) => {
                      onClickWord(w)
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
