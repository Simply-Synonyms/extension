/* Content scripts run in an isolated environment, but we can inject this script into the page itself to interact with it directly (needed to trigger keyboard events).
 * https://stackoverflow.com/a/9517879/8748307
 */
import {
  onPageInterfaceMessage,
  sendPageInterfaceMessage,
} from './scriptInterface'

// // Fire every event in the keypress cycle to ensure reliability across sites
// const simulateKeypress = (key: string, selector: string) => {
//   const el = document
//   setTimeout(() => {
//     // add keycodes and charcodes?
//     console.log(selector)
//     el.dispatchEvent(new window.KeyboardEvent('focus', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('keydown', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('beforeinput', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('keypress', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('input', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('change', {
//       bubbles: true,
//       key: key,
//     }))
//     el.dispatchEvent(new window.KeyboardEvent('keyup', {
//       bubbles: true,
//       key: key,
//     }))
//   }, 0)
// }

// onPageInterfaceMessage('clipboardPaste', async () => {
//   console.log('PASTINGGGG', await navigator.clipboard.readText())
//   document.execCommand('paste')
// })

// onPageInterfaceMessage('dispatchKeypressEvent', (data) => {
//   // https://stackoverflow.com/a/63595176/8748307
//   // const keyEvent = document.createEvent('Event') as any
//   // keyEvent.initEvent('keypress', true, true)
//   // keyEvent.key = data.key
//   // keyEvent.keyCode = data.key === 'Backspace' ? 8 : data.key.charCodeAt(0)
//   // console.log(document.querySelector(data.selector))
//   // document.querySelector(data.selector).dispatchEvent(keyEvent)
//   // document.execCommand('insertText', false, data.key)
//   simulateKeypress(data.key, data.selector)
// })

onPageInterfaceMessage('simulateGoogleDocKeypress', data => {
  // https://stackoverflow.com/a/63595176/8748307
  const keyEvent = document.createEvent('Event') as any
  keyEvent.initEvent('keypress', true, true)
  keyEvent.key = data.key
  keyEvent.keyCode = data.key.charCodeAt(0)
  ;(
    document.querySelector('.docs-texteventtarget-iframe') as any
  ).contentDocument.activeElement.dispatchEvent(keyEvent)
})

// onPageInterfaceMessage('googleDocsClipboardCopy', (data) => {
//   // https://stackoverflow.com/a/63595176/8748307
//   const keyEvent = document.createEvent('Event') as any
//   keyEvent.initEvent('keydown', true, true)
//   keyEvent.key = 'Meta'
//   keyEvent.keyCode = 91
//   keyEvent.metaKey = true
//   ;(
//     document.querySelector('.docs-texteventtarget-iframe') as any
//   ).contentDocument.activeElement.dispatchEvent(keyEvent)

//   const keyEvent2 = document.createEvent('Event') as any
//   keyEvent2.initEvent('keypress', true, true)
//   keyEvent2.key = 'c'
//   keyEvent2.keyCode = 67
//   keyEvent2.metaKey = true
//   ;(
//     document.querySelector('.docs-texteventtarget-iframe') as any
//   ).contentDocument.activeElement.dispatchEvent(keyEvent2)

//   console.log('DISPATCH')
// })

// Dev tools
// window.simplySynonyms = {
//   hello() {
//     console.log(
//       "Hello! You found the Simply Synonyms developer interface. You can call these functions from the dev tools or from your own website's JS ;)"
//     )
//   },
//   closePopup() {
//     sendPageInterfaceMessage('closePopup')
//   },
//   // openWithWord (word) {
//   //   sendPageInterfaceMessage('openPopup', { word })
//   // }
// }
