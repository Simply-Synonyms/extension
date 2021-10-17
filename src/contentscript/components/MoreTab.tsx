import Preact from 'preact'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { getFavoriteWords, GetFavoriteWordsResponse } from '../../api'
import Loader from './Loader'
import { useIsLoggedIn } from '../../lib/hooks'
import { WEBSITE_URL } from '../../config'

const MoreTab: Preact.FunctionComponent<{
  onWordClick: (word: string) => void
  isExploringWord: boolean
}> = ({ onWordClick, isExploringWord }) => {
  const isLoggedIn = useIsLoggedIn()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<GetFavoriteWordsResponse>(null)

  const loadFavoritesData = async () => {
    setFavorites(null)

    const data =
      (await getFavoriteWords().catch((err) => {
        toast.error(
          `Something went wrong and we couldn't fetch your favorites`,
          {
            duration: 3000,
          }
        )
      })) || null

    setLoading(false)
    if (data) setFavorites(data)
  }

  useEffect(() => {
    // Need to refresh data when we stop exploring a word as it might have changed
    if (isLoggedIn && !isExploringWord) loadFavoritesData()
  }, [isLoggedIn, isExploringWord])

  return (
    <>
      {isLoggedIn && (
        <>
          <h2>Favorites</h2>
          {loading && <Loader />}
          <div class="words">
            {favorites?.favoriteWords?.map((w) => (
              <div class="container" key={w.id}>
                <span
                  class="word"
                  onClick={(e) => {
                    onWordClick(w.word)
                    e.stopPropagation()
                  }}
                >
                  {w.word}
                </span>
              </div>
            ))}
            {!loading && !favorites?.favoriteWords?.length && (
              <small class="muted">
                Mark a favorite word by pressing the star icon next beside its
                definition.
              </small>
            )}
          </div>
        </>
      )}
      {!isLoggedIn && (
        <p>
          <strong>
            Please sign in to Simply Synonyms to access this feature
          </strong>
        </p>
      )}
    </>
  )
}

export default MoreTab
