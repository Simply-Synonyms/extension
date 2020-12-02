/* Utils for interacting with pageInterfaceScript.js
 * https://stackoverflow.com/a/19312198/8748307
 */
import browser from 'browserApi'

// Function to send a jsonified message to either the content script or injected function
export function sendPageInterfaceMessage (type, data) {
  document.dispatchEvent(new CustomEvent('SimplySynonymsPageInterface', { detail: { type, data: JSON.stringify(data) }}))
}

// Function to register a callback listener
export function onPageInterfaceMessage(type, callback) {
  document.addEventListener('SimplySynonymsPageInterface', e => {
    if (e.detail.type === type) callback(JSON.parse(e.detail.data))
  })
}

// Function to add page script to HTML document
export default function injectPageScript() {
  const script = document.createElement('script')
  script.src = browser.runtime.getURL('pageScript.bundle.js')
  document.head.appendChild(script)
}
