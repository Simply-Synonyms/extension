import React from 'preact'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { AiOutlineLoading } from '@react-icons/all-files/ai/AiOutlineLoading'
import { useEffect, useRef, useState } from 'preact/hooks'
import clsx from 'clsx'
import { search } from '../../api'
import { useGlobalState } from '../state'
import { useDataStore } from '../datastore'

const searchDelay = 200

const SearchTab: React.FunctionComponent<{}> = ({}) => {
  const inputRef = useRef<HTMLInputElement>()
  const [input, setInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [lastCharTime, setLastCharTime] = useState<number>()
  const [results, setResults] = useState<string[]>([])

  const [exploringWord, setExploringWord] = useGlobalState(s => [
    s.exploringWord,
    s.setExploringWord,
  ])

  const setActiveText = useDataStore(s => s.setActiveText)

  const doSearch = async () => {
    setSearching(true)

    setResults(['cheese', 'amazing', 'potatos', 'by no means', 'should not work'])
    // setResults((await search(input)).results)
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

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return (
    <div class="search-tab">
      <div class="input-container">
        <span class={clsx('icon', searching && 'spin')}>
          {searching ? <AiOutlineLoading size={22} /> : <FiSearch size={22} />}
        </span>
        <input
          ref={inputRef}
          onInput={e => {
            setInput((e.target as any).value)
            setLastCharTime(Date.now())
          }}
        />
      </div>

      {input && (
        <div class="results">
          {results?.map(r => (
            <div onClick={() => setActiveText(r)}>{r}</div>
          ))}
        </div>
      )}

      {!input && (
        <div class="hint-text">
          <ul>
            <li>Start typing for suggestions</li>
            <li>
              Click a search result to get synonyms, antonyms and definitions
            </li>
            <li>
              Enter a description to get a list of suggestions with similar meanings
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchTab
