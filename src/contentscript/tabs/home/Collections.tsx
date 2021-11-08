import React from 'preact'
import { SubTabProps } from '../HomeTab'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { FiPlus } from '@react-icons/all-files/fi/FiPlus'
import { StoreDataType, useDataStore } from '../../datastore'
import { useEffect, useRef, useState } from 'preact/hooks'
import { BsCaretRightFill } from '@react-icons/all-files/bs/BsCaretRightFill'
import clsx from 'clsx'
import { CollectionsTree } from '../../../api'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobalState } from '../../state'

// /** Returns a branch given the tree and an array of node IDs */
// const getBranch = (tree: CollectionsTree, path: string[]) => {
//   let b = tree
//   for (const id of path) {
//     b = b.find(node => node.id === id).children
//   }
//   return b
// }

const CollectionsTreeNode: React.FunctionComponent<{
  /** Currently expanded branch path */
  expandedPath: string[]
  path: string[]
  /** This node */
  collection: CollectionsTree[0]
  collections: StoreDataType['collections']['data']
  onClick: (path: string[]) => void
  onAnimation: () => void
  onItemClick: (id: string) => void
}> = ({
  expandedPath,
  collection: c,
  path,
  onClick,
  onAnimation,
  collections,
  onItemClick,
}) => {
  const ref = useRef<HTMLDivElement>()

  const items = collections[c.id].items

  const isExpanded = expandedPath.includes(c.id)

  const animateHeight = expandedPath.slice(-1)[0] === c.id || !isExpanded

  return (
    <div
      class="node"
      style={{
        paddingLeft: `${(path.length - 1) * 4}px`,
      }}
    >
      <button
        class={clsx('name', isExpanded ? 'expanded' : 'bold')}
        onClick={() => onClick(path)}
        key={c.id}
      >
        <span class={'caret'}>
          <BsCaretRightFill size={16} />
        </span>
        <span>{c.name}</span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            class="contents"
            style={{
              transformOrigin: 'top left',
            }}
            variants={{
              expanded: () => ({
                maxHeight: animateHeight ? ref.current?.scrollHeight : null,
                scale: 1,
                opacity: 1,
              }),
              collapsed: () => ({
                maxHeight: 0,
                scale: 0.8,
                opacity: 0,
              }),
            }}
            animate={'expanded'}
            initial={'collapsed'}
            exit={'collapsed'}
            ref={ref}
            onAnimationComplete={() => {
              onAnimation()
            }}
          >
            {!!c.children.length && (
              <div class="branch">
                {c.children.map(c2 => (
                  <CollectionsTreeNode
                    onItemClick={onItemClick}
                    expandedPath={expandedPath}
                    collection={c2}
                    path={path.concat([c2.id])}
                    onClick={onClick}
                    onAnimation={onAnimation}
                    collections={collections}
                  />
                ))}
              </div>
            )}
            <div class="items">
              <div class="container">
                <span class="item add-btn">
                  <FiPlus size={14} />
                  <span>Add</span>
                </span>
              </div>
              {items?.map(i => (
                <div class="container">
                  <span
                    class="item"
                    onClick={e => {
                      onItemClick(i.text)
                      e.stopPropagation()
                    }}
                  >
                    {i.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Collections: React.FunctionComponent<SubTabProps> = ({ reposition }) => {
  const [tree, collections, loadCollections, loadItems] = useDataStore(s => [
    s.collections.tree,
    s.collections.data,
    s.loadCollections,
    s.loadCollectionItems,
  ])

  const [exploringWord, setExploringWord] = useGlobalState(s => [
    s.exploringWord,
    s.setExploringWord,
  ])

  const [expandedPath, setExpandedPath] = useState<string[]>([])

  const onClick = (path: string[]) => {
    const lastId = path[path.length - 1]
    if (expandedPath.includes(lastId)) {
      // This collection is already expanded, collapse down to it
      setExpandedPath(expandedPath.slice(0, expandedPath.indexOf(lastId)))
    } else {
      setExpandedPath(path)
      loadItems(lastId)
    }
  }

  const onItemClick = (text: string) => {
    setExploringWord(text)
  }

  useEffect(() => {
    loadCollections()
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
        {tree &&
          tree.map(c => (
            <CollectionsTreeNode
              expandedPath={expandedPath}
              collection={c}
              path={[c.id]}
              onClick={onClick}
              onAnimation={reposition}
              onItemClick={onItemClick}
              collections={collections}
            />
          ))}
      </div>
    </>
  )
}

export default Collections
