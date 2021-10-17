import Preact from 'preact'
import { UserSettings } from '../lib/settings'
import browser from 'browserApi'
import AppPopup from './Popup'
import { useEffect, useState, useRef } from 'preact/hooks'
import { Toaster } from 'react-hot-toast'

export type TargetType = 'gdoc' | 'contenteditable' | 'input'

const App: Preact.FunctionComponent<{
  settings: UserSettings
}> = ({ settings }) => {
  const popupRef = useRef<HTMLDivElement>()

  const [popupOpen, setPopupOpen] = useState(false)
  // const [position, setPosition] = useState<[x: number, y: number]>(null)

  let enableOnSite = !settings.siteDisableList.includes(window.location.host)

  const wordRef = useRef<string>()
  const positionRef = useRef<[x: number, y: number]>()
  const targetTypeRef = useRef<TargetType>()
  const targetElRef = useRef<HTMLElement>()

  // Function to find selected word and open synonym popup.
  function processDoubleClick(e, w?) {
    if (!enableOnSite) return

    // Figure out which type of element the word is in (the target). Null means the the text isn't editable
    let targetType: TargetType = null
    if (window.location.hostname === 'docs.google.com') targetType = 'gdoc'
    else if (e.target.hasAttribute('contenteditable'))
      targetType = 'contenteditable'
    if (['input', 'textarea'].includes(e.target.nodeName.toLowerCase()))
      targetType = 'input'

    if (!targetType && settings.onlyEditableText) return

    let word, selection, googleDoc
    if (targetType === 'gdoc') {
      // TODO support Google Docs with their new canvas renderer
      return
    } else {
      selection = window.getSelection()
      word = w || selection.toString().trim()
    }

    if (word.length < 2) return
    if (word.includes(' ')) return

    // Don't open popup again if user selected a word within popup
    if (!e || popupRef.current?.contains(e.target)) return

    positionRef.current = [e.clientX, e.clientY]
    wordRef.current = word
    targetTypeRef.current = targetType
    targetElRef.current = e.target
    setPopupOpen(true)
    // onPageInterfaceMessage('closePopup', (_) => resetPopup())
  }

  useEffect(() => {
    // TODO cleanup
    browser.runtime.onMessage.addListener((msg) => {
      switch (msg.action) {
        case 'openQuickSearch':
          // QuickSearchPopup.open()
          break
        case 'enableDoubleClickPopup':
          enableOnSite = !!msg.enable
          break
      }
    })

    document.body.addEventListener('dblclick', processDoubleClick)

    document.body.addEventListener('click', (e) => {
      if (!popupRef.current?.contains(e.target as any)) setPopupOpen(false)
    })
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
        word={wordRef.current}
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