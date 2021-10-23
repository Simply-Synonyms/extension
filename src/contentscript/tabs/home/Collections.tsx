import React from 'preact'
import { SubTabProps } from '../HomeTab'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { FiPlus } from '@react-icons/all-files/fi/FiPlus'
import { useDataStore } from '../../datastore'
import { useEffect } from 'preact/hooks'
import { BsCaretRightFill } from '@react-icons/all-files/bs/BsCaretRightFill'

const Collections: React.FunctionComponent<SubTabProps> = ({
  isExploringWord,
  onWordClick,
}) => {
  const [tree, loadTree] = useDataStore((s) => [
    s.collections.tree,
    s.loadCollectionsTree,
  ])

  useEffect(() => {
    loadTree()
  }, [])

  return (
    <>
      <div class="collections-search-bar">
        <div class="input-container">
          <span class="icon">
            <FiSearch size={22} />
          </span>
          <input />
        </div>
        <button>
          <FiPlus size={22} />
          <span>New</span>
        </button>
      </div>
      <div class="collections">
        {tree && tree.map((c) => (
            <div class="collection" key={c.id}>
              <BsCaretRightFill size={16} />
              <span>{c.name}</span>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default Collections
