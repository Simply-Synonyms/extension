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
// function getUniqueElementSelector(targetEl: HTMLElement) {
//   let el = targetEl
//   if (el.tagName === 'BODY') return 'BODY'

//   const ancestry = []
//   while (el.parentElement && el.tagName !== 'BODY') {
//     if (el.id) {
//       ancestry.unshift('#' + el.getAttribute('id'))
//       // break
//     } else {
//       // Count which sibling element is
//       let c = 1
//       for (let e = el; e.previousElementSibling; e = e.previousElementSibling as any, c++) {}
//       ancestry.unshift(el.tagName + ':nth-child(' + c + ')')
//     }
//     el = el.parentElement
//   }

//   return ancestry.join('>')
// }

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
    try {
      targetRangeRef.current = window.getSelection().getRangeAt(0)
    } catch {}
    targetElRef.current = targetEl
    setPopupOpen(expandImmediate ? 'expand' : true)
  }

  // Function to find selected word and open synonym popup.
  async function processEvent(e: Event) {
    if (!enableOnSite) return

    // Don't open popup again if user selected a word within popup
    if (popupRef.current?.contains(e.target as any)) return

    // Figure out which type of element the target is. Null targetType means the the text isn't editable
    let targetType: TargetType = null,
      text: string

    if (window.location.hostname === 'docs.google.com') {
      targetType = 'gdoc'

      // document.execCommand('copy')
      // text = await new Promise((resolve) =>
      //   browser.runtime.sendMessage({ action: 'getClipboardText' }, resolve)
      // )

      // console.log(text, window.getSelection().toString(), 'aa')

      // TODO
      text = 'amazing'

      // return
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
    }

    if (text.length < 3) text = ''

    positionRef.current = [(e as any).clientX, (e as any).clientY]
    textRef.current = text.trim()
    targetTypeRef.current = targetType
    // Open the popup immediately if this was a double click of a single word
    if (text && e.type === 'dblclick' && !text.trim().includes(' '))
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

  const replaceText = async (newTextRaw: string) => {
    let newText = newTextRaw
    const oldText = textRef.current
    if (oldText === oldText.toUpperCase()) newText = newText.toUpperCase()
    else if (oldText[0] === oldText[0].toUpperCase())
      newText = newText[0].toUpperCase() + newText.slice(1)

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
        // This is a VERY hacky, not to mention deprecated, way of replacing the text, but it's the only way that seems to work reliably.
        // Reselect the range we need to change
        const range = targetRangeRef.current
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)

        // Store the current clipboard and replace it with the new text
        const oldClipboard = await navigator.clipboard.read()
        await navigator.clipboard.writeText(newText)
        // Paste the new text into the document, then write the old content back to the clipboard.
        document.execCommand('paste')
        await navigator.clipboard.write(oldClipboard)
        break
      }
      case 'gdoc': {
        // Replace selected word by typing out letters in new word
        for (let i = 0; i < newText.length; i++) {
          sendPageInterfaceMessage('simulateGoogleDocKeypress', {
            key: newText[i],
          })
        }
        break
      }
    }
    setPopupOpen(false)
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
