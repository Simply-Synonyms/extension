import React from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useAsyncRequest, useIsSignedIn } from '../../../lib/hooks'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useDataStore } from '../../datastore'
import { SubTabProps } from '../HomeTab'

/** Map entries to a list of words filtered to favorites */
export const useFavoriteWords = () =>
  useDataStore((s) =>
    Object.entries(s.entries)
      .filter(([_, e]) => e.isFavorite)
      .map(([t]) => t)
  )

const Favorites: React.FunctionComponent<SubTabProps> = ({
  isExploringWord,
  onWordClick,
}) => {
  const isLoggedIn = useIsSignedIn()
  const favorites = useFavoriteWords()
  const [loading, setLoading] = useState(false)
  const loadFavorites = useDataStore((s) => s.getFavorites)

  useEffect(() => {
    // Need to refresh data when we stop exploring a word as it might have changed
    if (isLoggedIn && !isExploringWord) {
      loadFavorites().then(() => setLoading(false))
    }
  }, [isLoggedIn, isExploringWord])

  return (
    <>
      {loading && <LoadingSpinner />}
      <div class="words">
        {favorites.map((w) => (
          <div class="container" key={w}>
            <span
              class="word"
              onClick={(e) => {
                onWordClick(w)
                e.stopPropagation()
              }}
            >
              {w}
            </span>
          </div>
        ))}
        {!loading && !favorites.length && (
          <small class="muted">
            Mark a favorite word by pressing the star icon beside its
            definition.
          </small>
        )}
      </div>
    </>
  )
}

export default Favorites
