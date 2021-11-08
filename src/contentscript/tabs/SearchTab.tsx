import React from 'preact'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { AiOutlineLoading } from '@react-icons/all-files/ai/AiOutlineLoading'
import { useEffect, useState } from 'preact/hooks'
import clsx from 'clsx'
import { search } from '../../api'
import { useGlobalState } from '../state'

const searchDelay = 200

const SearchTab: React.FunctionComponent<{}> = ({}) => {
  const [input, setInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [lastCharTime, setLastCharTime] = useState<number>()
  const [results, setResults] = useState<string[]>([])

  const [exploringWord, setExploringWord] = useGlobalState(s => [
    s.exploringWord,
    s.setExploringWord,
  ])

  const doSearch = async () => {
    setSearching(true)

    setResults((await search(input)).results)
    setSearching(false)
  }

  useEffect(() => {
    setSearching(false)

    if (input.length > 1) {
      const searchTimeout = setTimeout(() => {
        doSearch()
      }, searchDelay)

      return () => clearTimeout(searchTimeout)
    }
  }, [lastCharTime])

  return (
    <div class="search-tab">
      <div class="input-container">
        <span class={clsx('icon', searching && 'spin')}>
          {searching ? <AiOutlineLoading size={22} /> : <FiSearch size={22} />}
        </span>
        <input
          onInput={e => {
            setInput((e.target as any).value)
            setLastCharTime(Date.now())
          }}
        />
      </div>

      {input && (
        <div class="results">
          {results?.map(r => (
            <div onClick={() => setExploringWord(r)}>{r}</div>
          ))}
        </div>
      )}

      {!input && (
        <div class="hint-text">
          <h4>Try:</h4>
          <ul>
            <li>
              Searching for a word or term to get definitions, synonyms and
              antonyms
            </li>
            <li>
              Describing something to get a list of words with a similar meaning
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchTab
