import React from 'preact'
import Preact from 'preact'
import browser from 'browserApi'
import Thesaurus from '../components/Thesaurus'
import { useDataStore } from '../datastore'
import LoadingSpinner from '../components/LoadingSpinner'

const ThesaurusTabs: Preact.FunctionComponent<{
  tab: 'synonyms' | 'antonyms'
  word: string
}> = ({ tab, word }) => {

  const [thesaurusData, thesaurusLoading] = useDataStore(
    s => {
      console.log(s.entries, s.activeEntry)
      return s.entries[s.activeEntry].thesaurus
    }
  )

  const noResults =
    !thesaurusLoading &&
    !(tab === 'synonyms' ? thesaurusData?.synonyms : thesaurusData?.antonyms)
      ?.length

  return (
    <>
      <h2 class={noResults && 'center'}>
        {!noResults ? 'Results for' : `No ${tab} found for`}
        <span class="primary-color"> {word}</span>
      </h2>
      {noResults && (
        <img src={browser.runtime.getURL('/assets/undraw_not_found.svg')} />
      )}
      {thesaurusLoading && <LoadingSpinner />}
      <Thesaurus word={word} show={tab} />
    </>
  )
}

export default ThesaurusTabs
