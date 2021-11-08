import React from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useAsyncRequest, useIsSignedIn } from '../../lib/hooks'
import { WEBSITE_URL } from '../../config'
import Favorites from './home/Favorites'
import Collections from './home/Collections'

export interface SubTabProps {
  reposition: () => void
}

const HomeTab: React.FunctionComponent<{} & SubTabProps> = ({
  ...tabProps
}) => {
  const isLoggedIn = useIsSignedIn()
  const [subtab, setSubtab] = useState<'favorites' | 'collections' | 'tools'>(
    'favorites'
  )

  return (
    <>
      <div class="home-tabs">
        <button
          class={subtab === 'favorites' && 'active'}
          onClick={() => setSubtab('favorites')}
        >
          Favorites
        </button>
        <button
          class={subtab === 'collections' && 'active'}
          onClick={() => setSubtab('collections')}
        >
          Collections
        </button>
        <button
          class={subtab === 'tools' && 'active'}
          onClick={() => setSubtab('tools')}
        >
          Tools
        </button>
      </div>

      {subtab === 'favorites' && <Favorites {...tabProps} />}
      {subtab === 'collections' && <Collections {...tabProps} />}

      {!isLoggedIn && (
        <div class="authwall-overlay">
          You need an account to access these features.
          <a
            class="button"
            target="_blank"
            rel="noopener noreferrer"
            href={WEBSITE_URL + '/app/signup'}
          >
            Sign up
          </a>
        </div>
      )}
    </>
  )
}

export default HomeTab
