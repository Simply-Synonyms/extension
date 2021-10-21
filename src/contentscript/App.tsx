import Preact from 'preact'
import { UserSettings } from '../lib/settings'
import browser from 'browserApi'
import AppPopup from './Popup'
import { useEffect, useState, useRef } from 'preact/hooks'
import { Toaster } from 'react-hot-toast'
import { useIsSignedIn, useUserStore } from '../lib/hooks'
import { getAccountStatus } from '../api'

export type TargetType = 'gdoc' | 'contenteditable' | 'input'

const App: Preact.FunctionComponent<{
  settings: UserSettings
}> = ({ settings }) => {
  // Get the account status whenever we are authenticated
  const isSignedIn = useIsSignedIn()
  useEffect(() => {
    if (isSignedIn)
      getAccountStatus().then((account) => {
        useUserStore.setState({
          account,
        })
      })
  }, [isSignedIn])

  const popupRef = useRef<HTMLDivElement>()

  const [popupOpen, setPopupOpen] = useState<boolean | 'expand'>(false)
  // const [position, setPosition] = useState<[x: number, y: number]>(null)

  let enableOnSite = !settings.siteDisableList.includes(window.location.host)

  const textRef = useRef<string>()
  const positionRef = useRef<[x: number, y: number]>()
  const targetTypeRef = useRef<TargetType>()
  const targetElRef = useRef<HTMLElement>()

  // Function to find selected word and open synonym popup.
  function processEvent(e: Event) {
    if (!enableOnSite) return

    // Don't open popup again if user selected a word within popup
    if (popupRef.current?.contains(e.target as any)) return

    // Figure out which type of element the target is. Null targetType means the the text isn't editable
    let targetType: TargetType = null,
      text: string

    if (window.location.hostname === 'docs.google.com') {
      targetType = 'gdoc'

      // TODO handle google doc
      return
    } else {
      if ((e.target as any).hasAttribute('contenteditable'))
        targetType = 'contenteditable'
      if (
        ['input', 'textarea'].includes((e.target as any).nodeName.toLowerCase())
      )
        targetType = 'input'

      // Only enable on editable text; cancel
      if (!targetType && settings.onlyEditableText) return

      const sel = window.getSelection()
      text = sel.toString()

      if (text.length < 3) text = ''
    }

    positionRef.current = [(e as any).clientX, (e as any).clientY]
    textRef.current = text.trim()
    targetTypeRef.current = targetType
    targetElRef.current = e.target as any
    // Open the popup immediately if this was a double click of a single word
    if (text && e.type === 'dblclick' && !text.includes(' ')) setPopupOpen(true)
  }

  useEffect(() => {
    // TODO cleanup
    browser.runtime.onMessage.addListener((msg) => {
      switch (msg.action) {
        case 'openQuickSearch':
          // QuickSearchPopup.open()
          break
        // case 'enableDoubleClickPopup':
        //   enableOnSite = !!msg.enable
        //   break
        case 'openPopup':
          // Expand the popup immediately
          setPopupOpen('expand')
          break
      }
    })

    document.addEventListener('click', (e) => {
      if (!popupRef.current?.contains(e.target as any)) setPopupOpen(false)
    })

    document.body.addEventListener('dblclick', processEvent)
    document.addEventListener('mouseup', processEvent)
    document.addEventListener('contextmenu', processEvent)
    document.addEventListener('keyup', processEvent)
  }, [])

  return (
    <div id="ssyne-container">
      <Toaster
        position="bottom-center"
        containerStyle={{
          zIndex: 100001,
          fontWeight: 600,
        }}
      />
      <AppPopup
        text={textRef.current}
        ref={popupRef}
        position={positionRef.current}
        targetType={targetTypeRef.current}
        targetEl={targetElRef.current}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  )
}

export default App
