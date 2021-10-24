import { AnimatePresence, motion } from 'framer-motion'
import React from 'preact'
import { useState } from 'preact/hooks'
import { useIsSignedIn } from '../../lib/hooks'
import { useDataStore } from '../datastore'
import BookmarkPlus from '../icons/BookmarkPlus'
import { PopupContentPortal } from '../Popup'
import { POPUP_WIDTH } from '../positioning'

const SaveTextButton = ({ text }: { text: string }) => {
  const isSignedIn = useIsSignedIn()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        title="Save to my collection"
        onClick={async (e) => {
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
            <motion.div initial={{
              left: POPUP_WIDTH,
              opacity: 0
            }} animate={{
              left: 0,
              opacity: 1
            }} exit={{
              left: POPUP_WIDTH,
              opacity: 0
            }} className="text-save-dialog">hello there</motion.div>
          )}
        </AnimatePresence>
      </PopupContentPortal>
    </>
  )
}

export default SaveTextButton
