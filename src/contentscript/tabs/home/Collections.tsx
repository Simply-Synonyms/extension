import React from 'preact'
import { useEffect } from 'preact/hooks'
import { useAsyncRequest, useIsSignedIn } from '../../../lib/hooks'
import LoadingSpinner from '../../components/LoadingSpinner'
import { SubTabProps } from '../HomeTab'
import Input from '../../components/Input'
import { FiSearch } from '@react-icons/all-files/fi/FiSearch'
import { FiPlus } from '@react-icons/all-files/fi/FiPlus'

const Collections: React.FunctionComponent<SubTabProps> = ({
  isExploringWord,
  onWordClick,
}) => {
  const isLoggedIn = useIsSignedIn()
  // const [favorites, loading, loadFavorites] =
  //   useAsyncRequest<GetFavoriteWordsResponse>(
  //     () => getFavoriteWords(),
  //     `Something went wrong and we couldn't fetch your favorites`
  //   )

  // useEffect(() => {
  //   // Need to refresh data when we stop exploring a word as it might have changed
  //   if (isLoggedIn && !isExploringWord) loadFavorites()
  // }, [isLoggedIn, isExploringWord])

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
    </>
  )
}

export default Collections
