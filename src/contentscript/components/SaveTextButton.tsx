import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'preact'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { CollectionsTree, createCollectionItem } from '../../api'
import { useIsSignedIn } from '../../lib/hooks'
import { useDataStore } from '../datastore'
import BookmarkPlus from '../icons/BookmarkPlus'
import { PopupContentPortal } from '../Popup'
import { POPUP_WIDTH } from '../positioning'

const CollectionsTreeNode: React.FunctionComponent<{
  path: string[]
  /** This node */
  collection: CollectionsTree[0]
  onClick: (id: string) => void
}> = ({ collection: c, path, onClick }) => {
  return (
    <div
      style={{
        paddingLeft: `${(path.length - 1) * 4}px`,
      }}
    >
      <button class={'collection'} onClick={() => onClick(c.id)} key={c.id}>
        <span>{c.name}</span>
      </button>
      <div>
        {c.children.map(c2 => (
          <CollectionsTreeNode
            collection={c2}
            path={path.concat([c2.id])}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}

const SaveTextButton = ({ text }: { text: string }) => {
  const isSignedIn = useIsSignedIn()
  const [open, setOpen] = useState(false)

  const [tree, loadTree] = useDataStore(s => [
    s.collections.tree,
    s.loadCollections,
  ])

  useEffect(() => {
    loadTree()
  }, [])

  const onClick = async (id: string) => {
    try {
      const res = await createCollectionItem(text, id)
      if (!res.success) {
        toast.error(`Couldn't save that. Please try again.`)
        throw `Error`
      }
      toast.success('Saved 🗄')
      setOpen(false)
    } catch (e) {}
  }

  return (
    <>
      <button
        title="Save to my collection"
        onClick={async e => {
          e.stopPropagation()

          setOpen(true)

          // if (!isSignedIn) {
          //   toast.error('Make an account to save to your collection')
          //   return
          // }

          // onChange(!isFavorite)
          // try {
          //   const res = await favoriteWord(word, isFavorite)
          //   if (!res.success) throw `Couldn't update favorite`
          //   onChange(res.favorite)
          //   toast(
          //     res.favorite
          //       ? `⭐️ Saved ${word} to favorites`
          //       : `🗑 Removed ${word} from favorites`
          //   )
          // } catch (e) {
          //   onChange(isFavorite)
          // }
        }}
        class="bounce-button"
      >
        <BookmarkPlus size={18} />
      </button>

      <PopupContentPortal>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                // left: POPUP_WIDTH,
                opacity: 0,
              }}
              animate={{
                // left: 0,
                opacity: 1,
              }}
              exit={{
                // left: POPUP_WIDTH,
                opacity: 0,
              }}
              className="text-save-dialog"
            >
              <button onClick={() => setOpen(false)} class="back">
                Cancel
              </button>

              <p class="instruction">Select a collection to save this to</p>

              {tree &&
                tree.map(c => (
                  <CollectionsTreeNode
                    collection={c}
                    path={[c.id]}
                    onClick={onClick}
                  />
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </PopupContentPortal>
    </>
  )
}

export default SaveTextButton
