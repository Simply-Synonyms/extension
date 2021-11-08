import browser from 'browserApi'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { GetAccountStatusResponse } from '../api'
import create from 'zustand'

export const useUserStore = create<{
  isSignedIn: boolean
  account: GetAccountStatusResponse
}>(set => ({
  isSignedIn: false,
  account: null,
}))

export function useIsSignedIn(): boolean {
  const is = useUserStore(s => s.isSignedIn)

  browser.runtime.sendMessage(
    {
      action: 'checkIsLoggedIn',
    },
    r => {
      useUserStore.setState({
        isSignedIn: r,
      })
    }
  )

  return is
}

export const useAccountStatus = () => useUserStore(s => s.account)

export function useAsyncRequest<T extends unknown>(
  /** A function that should return a promise that resolves to the API data */
  request: () => Promise<any>,
  /** If the request fails, create a toast with this message */
  errorToast?: string,
  /** Take the raw data from the API and map it to the returned data from the hook */
  processResponse: (data: any, oldData: T) => T = d => d as T,
  /** An array of dependencies which will trigger a refresh when changed. Or, pass false to never automatically refresh */
  refreshDeps: Array<any> | false = false
): [
  data: T | null,
  loading: boolean,
  refresh: (withLoader?: boolean) => void,
  reset: () => void
] {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T>(null)

  const loadData = async (withLoader?: boolean) => {
    if (!data || withLoader) setLoading(true)

    const res =
      (await request().catch(err => {
        console.error('(Simply Synonyms error)', err)
        if (errorToast)
          toast.error(errorToast, {
            duration: 3000,
          })
      })) || null

    setLoading(false)
    if (res) setData(processResponse(res, data))
  }

  if (refreshDeps)
    useEffect(() => {
      loadData()
    }, refreshDeps)

  return [
    data as T,
    loading,
    (withLoader: boolean) => loadData(withLoader),
    () => {
      setData(null)
    },
  ]
}
