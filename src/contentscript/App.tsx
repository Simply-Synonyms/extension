import Preact from 'preact'
import { UserSettings } from '../lib/settings'
import browser from 'browserApi'
import AppPopup from './Popup'
import { useEffect, useState, useRef } from 'preact/hooks'
import { Toaster } from 'react-hot-toast'
import { useIsSignedIn, useUserStore } from '../lib/hooks'
import { getAccountStatus } from '../api'
import { sendPageInterfaceMessage } from './embedded/scriptInterface'

export type TargetType = 'gdoc' | 'contenteditable' | 'input'

// https://stackoverflow.com/a/66291608
function getUniqueElementSelector(targetEl: HTMLElement) {
  let el = targetEl
  if (el.tagName === 'BODY') return 'BODY'

  const ancestry = []
  while (el.parentElement && el.tagName !== 'BODY') {
    if (el.id) {
      ancestry.unshift('#' + el.getAttribute('id'))
      // break
    } else {
      // Count which sibling element is
      let c = 1
      for (let e = el; e.previousElementSibling; e = e.previousElementSibling as any, c++) {}
      ancestry.unshift(el.tagName + ':nth-child(' + c + ')')
    }
    el = el.parentElement
  }

  return ancestry.join('>')
}

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
  const targetRangeRef = useRef<Range>()

  const openPopup = (expandImmediate?: boolean, targetEl?: HTMLElement) => {
    if (popupOpen) return
    targetRangeRef.current = window.getSelection().getRangeAt(0)
    targetElRef.current = targetEl
    setPopupOpen(expandImmediate ? 'expand' : true)
  }

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
      if ((e.target as any).isContentEditable) targetType = 'contenteditable'
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
    // Open the popup immediately if this was a double click of a single word
    if (text && e.type === 'dblclick' && !text.includes(' '))
      openPopup(false, e.target as any)
  }

  useEffect(() => {
    // TODO cleanup
    browser.runtime.onMessage.addListener((msg) => {
      switch (msg.action) {
        case 'startSearch':
          positionRef.current = [200, 200]
          openPopup(true)
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

  const replaceText = (newText: string) => {
    switch (targetTypeRef.current) {
      case 'input': {
        const el = targetElRef.current as HTMLInputElement
        // Replace input text with a new string containing the new word
        el.value =
          el.value.slice(0, el.selectionStart) +
          newText +
          el.value.slice(el.selectionEnd)
        break
      }
      case 'contenteditable': {
        // const range = targetRangeRef.current
        // range.deleteContents()
        // range.insertNode(document.createTextNode(newText))
        // Replace selected word by typing out letters in new word
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(targetRangeRef.current)
        setTimeout(() => {for (let i = 0; i < newText.length; i++) {
          sendPageInterfaceMessage('dispatchKeypressEvent', {
            key: newText[i],
            selector: getUniqueElementSelector(targetElRef.current),
          })
        }}, 500)
        
        break
      }
      case 'gdoc':
        // Replace selected word by typing out letters in new word
        // for (let i = 0; i < wordChosen.length; i++) {
        //   sendPageInterfaceMessage('simulateGoogleDocKeypress', {
        //     key: wordChosen[i],
        //   })
        // }
        break
    }
    // setPopupOpen(false)
  }

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
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        replaceText={replaceText}
      />
    </div>
  )
}

export default App
