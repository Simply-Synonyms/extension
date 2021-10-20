import Preact from 'preact'
import { useEffect } from 'preact/hooks'
import { getFavoriteWords, GetFavoriteWordsResponse } from '../../api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAsyncRequest, useIsSignedIn } from '../../lib/hooks'

const MoreTab: Preact.FunctionComponent<{
  onWordClick: (word: string) => void
  isExploringWord: boolean
}> = ({ onWordClick, isExploringWord }) => {
  const isLoggedIn = useIsSignedIn()
  const [favorites, loading, loadFavorites] =
    useAsyncRequest<GetFavoriteWordsResponse>(
      () => getFavoriteWords(),
      `Something went wrong and we couldn't fetch your favorites`
    )

  useEffect(() => {
    // Need to refresh data when we stop exploring a word as it might have changed
    if (isLoggedIn && !isExploringWord) loadFavorites()
  }, [isLoggedIn, isExploringWord])

  return (
    <>
      {isLoggedIn && (
        <>
          <h2>Favorites</h2>
          {loading && <LoadingSpinner />}
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
