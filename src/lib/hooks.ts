import browser from 'browserApi'
import { useEffect, useState } from 'preact/hooks'

export function isLoggedIn(): Promise<boolean> {
  return new Promise((resolve) => {
    browser.runtime.sendMessage(
      {
        action: 'checkIsLoggedIn',
      },
      resolve
    )
  })
}

export function useIsLoggedIn(): boolean {
  const [is, setIs] = useState(false)

  useEffect(() => {
    isLoggedIn().then((l) => setIs(l))
  }, [])

  return is
}
