/* Content scripts run in an isolated environment, but we can inject this script into the page itself to interact with it directly.
 * https://stackoverflow.com/a/9517879/8748307
 */
import { onPageInterfaceMessage, sendPageInterfaceMessage } from './util/pageInterface'

// was using this file then realized it wasnt needed, leaving it here for now
// TODO figure out how to disable dev tools for just this entry (as most websites don't allow unsafe-eval)

onPageInterfaceMessage('simulateGoogleDocKeypress', data => {
  // https://stackoverflow.com/a/63595176/8748307
  const keyEvent = document.createEvent('Event')
  keyEvent.initEvent('keypress', true, true)
  keyEvent.key = data.key
  keyEvent.keyCode = data.key === 'Backspace' ? 8 : data.key.charCodeAt(0)
  document.querySelector('.docs-texteventtarget-iframe').contentDocument.activeElement
    .dispatchEvent(keyEvent)
})
