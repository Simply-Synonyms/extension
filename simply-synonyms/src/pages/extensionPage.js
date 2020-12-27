import './extensionPage.scss'
import browser from 'browserApi'

document.getElementById('version-text').innerText = `V${browser.runtime.getManifest().version}`
