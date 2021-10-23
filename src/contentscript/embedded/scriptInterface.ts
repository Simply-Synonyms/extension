/* Utils for interacting with pageInterfaceScript.js
 * https://stackoverflow.com/a/19312198/8748307
 */
import browser from 'browserApi'

const CUSTOM_EVENT_NAME = 'SSYNE_EVT'

type ActionType =
  | 'dispatchKeypressEvent'
  | 'simulateGoogleDocKeypress'
  | 'googleDocsClipboardCopy'

// Function to send a jsonified message to either the content script or injected function
export function sendPageInterfaceMessage(
  type: ActionType,
  data: Record<string, any> = {}
) {
  document.dispatchEvent(
    new CustomEvent(CUSTOM_EVENT_NAME, {
      detail: { type, data: JSON.stringify(data) },
    })
  )
}

// Function to register a callback listener
export function onPageInterfaceMessage(
  type: ActionType,
  callback: (data: Record<string, any>) => void
) {
  document.addEventListener(CUSTOM_EVENT_NAME, ((e: CustomEvent) => {
    if (e.detail.type === type) callback(JSON.parse(e.detail.data))
  }) as any)
}

// Function to add page script to HTML document
export function injectPageScript() {
  const script = document.createElement('script')
  script.id = 'simply-synonyms-embedded-script'
  script.src = browser.runtime.getURL('embeddedScript.bundle.js')
  document.head.appendChild(script)
}
