import React from 'preact'
import { SubTabProps } from '../HomeTab'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { FiPlus } from '@react-icons/all-files/fi/FiPlus'
import { useDataStore } from '../../datastore'
import { useEffect, useRef, useState } from 'preact/hooks'
import { BsCaretRightFill } from '@react-icons/all-files/bs/BsCaretRightFill'
import clsx from 'clsx'
import { CollectionsTree } from '../../../api'
import { AnimatePresence, motion } from 'framer-motion'

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
  onClick: (path: string[]) => void
  onAnimation: () => void
}> = ({ expandedPath, collection: c, path, onClick, onAnimation }) => {
  const ref = useRef<HTMLDivElement>()

  const isExpanded = expandedPath.includes(c.id)
  return (
    <div
      class="node"
      style={{
        paddingLeft: `${(path.length - 1) * 4}px`,
      }}
    >
      <button
        class={clsx('collection', isExpanded ? 'expanded' : 'bold')}
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
            className="branch"
            style={{
              transformOrigin: 'top left',
            }}
            variants={{
              expanded: () => ({
                height: ref.current?.scrollHeight,
                scale: 1,
                opacity: 1,
              }),
              collapsed: () => ({
                height: 0,
                scale: 0.8,
                opacity: 0,
              }),
            }}
            animate={'expanded'}
            initial={'collapsed'}
            exit={'collapsed'}
            ref={ref}
            onAnimationComplete={onAnimation}
          >
            {c.children.map((c2) => (
              <CollectionsTreeNode
                expandedPath={expandedPath}
                collection={c2}
                path={path.concat([c2.id])}
                onClick={onClick}
                onAnimation={onAnimation}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Collections: React.FunctionComponent<SubTabProps> = ({
  isExploringWord,
  onWordClick,
  reposition,
}) => {
  const [tree, loadTree] = useDataStore((s) => [
    s.collections.tree,
    s.loadCollectionsTree,
  ])

  const [expandedPath, setExpandedPath] = useState<string[]>([])

  const onClick = (path: string[]) => {
    const lastId = path[path.length - 1]
    if (expandedPath.includes(lastId)) {
      // This collection is already expanded, collapse down to it
      setExpandedPath(expandedPath.slice(0, expandedPath.indexOf(lastId)))
    } else {
      setExpandedPath(path)
    }
  }

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
        {tree &&
          tree.map((c) => (
            <CollectionsTreeNode
              expandedPath={expandedPath}
              collection={c}
              path={[c.id]}
              onClick={onClick}
              onAnimation={reposition}
            />
          ))}
      </div>
    </>
  )
}

export default Collections
