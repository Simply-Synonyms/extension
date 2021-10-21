import React from 'preact'
import { AiFillStar } from '@react-icons/all-files/ai/AiFillStar'
import { AiOutlineStar } from '@react-icons/all-files/ai/AiOutlineStar'
import toast from 'react-hot-toast'
import { favoriteWord } from '../../api'
import { useIsSignedIn } from '../../lib/hooks'
import { useDataStore } from '../datastore'

const AddWordToFavoritesButton = ({ word }: { word: string }) => {
  const [isFavorite, setFavorite] = useDataStore((s) => [
    s.entries[word]?.isFavorite,
    s.setFavorite,
  ])
  const isSignedIn = useIsSignedIn()

  const onChange = (f: boolean) => setFavorite(word, f)

  return (
    <button
      title="Add to favorites"
      onClick={async (e) => {
        e.stopPropagation()

        if (!isSignedIn) {
          toast.error('Make an account to save favorites')
          return
        }

        onChange(!isFavorite)
        try {
          const res = await favoriteWord(word, isFavorite)
          if (!res.success) throw `Couldn't update favorite`
          onChange(res.favorite)
          toast(
            res.favorite
              ? `⭐️ Saved ${word} to favorites`
              : `🗑 Removed ${word} from favorites`
          )
        } catch (e) {
          onChange(isFavorite)
        }
      }}
      class="bounce-button"
    >
      {isFavorite ? <AiFillStar size={20} /> : <AiOutlineStar size={20} />}
    </button>
  )
}

export default AddWordToFavoritesButton
