/* Content scripts run in an isolated environment, but we can inject this script into the page itself to interact with it directly.
 * https://stackoverflow.com/a/9517879/8748307
 */
import { onPageInterfaceMessage, sendPageInterfaceMessage } from './util/pageInterface'

// was using this file then realized it wasnt needed, leaving it here for now
