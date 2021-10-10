import React from 'preact'
import { UserSettings } from '../lib/settings'
import browser from 'browserApi'
import AppPopup from './Popup'
import { useEffect, useState, useRef } from 'preact/hooks'

let closeCallback = () => {}

const App: React.FunctionComponent<{
  settings: UserSettings
}> = ({ settings }) => {
  const popupRef = useRef<HTMLDivElement>()

  const [popupOpen, setPopupOpen] = useState(false)
  const [position, setPosition] = useState<[x: number, y: number]>([50, 50])

  let enableOnSite = !settings.siteDisableList.includes(window.location.host)

  // Function to find selected word, fetch synonyms and open synonym popup.
  function processDoubleClick(e, w?) {
    if (!enableOnSite) return

    // Figure out which type of element the word is in (the target). Null means the the text isn't editable
    let targetType = null
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

    setPosition([e.clientX, e.clientY])
    setPopupOpen(true)
    // onPageInterfaceMessage('closePopup', (_) => resetPopup())
  }

  useEffect(() => {
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setPopupOpen(false)
    })
    document.addEventListener('click', (e) => {
      if (!popupRef.current?.contains(e.target as any)) setPopupOpen(false)
    })
  })

  return (
    <div id="ssyne-container">
      <AppPopup word="a" ref={popupRef} position={position} open={popupOpen} />
    </div>
  )
}

export default App
