import './pageStyles.scss'
import browser from 'browserApi'
import { getSettings, saveSettings } from '../common/settings'

document.getElementById('version-text').innerText = `V${browser.runtime.getManifest().version}`

const settingsDiv = document.getElementById('settings')

if (settingsDiv) {
  const controls = {
    disabled: settingsDiv.querySelector('#option_disable'),
    onlyEditable: settingsDiv.querySelector('#option_only-editable'),
    disableList: settingsDiv.querySelector('#option_disable-list'),
    disableListSave: settingsDiv.querySelector('#option_disable-list + button'),
    shortcutsDiv: settingsDiv.querySelector('#keyboard-shortcuts'),
    openShortcutsLink: settingsDiv.querySelector('#open-shortcuts-link')
  }

  // Show all the current settings
  getSettings().then(settings => {
    controls.disabled.checked = settings.popupDisabled
    controls.onlyEditable.checked = settings.onlyEditableText
    controls.disableList.value = settings.siteDisableList?.join('\n')

    settingsDiv.style.display = 'block'
  })

  // Show keyboard shortcuts
  browser.commands.getAll(shortcuts => {
    for (const { description, shortcut } of Object.values(shortcuts)) {
      console.log(description, shortcut)
      const shortcutDescription = document.createElement('p')
      shortcutDescription.innerHTML = `${description || 'Open the extension panel'}: <code>${shortcut || 'Not set'}</code>`
      controls.shortcutsDiv.appendChild(shortcutDescription)
    }
  })

  // Open keyboard shortcuts page
  controls.openShortcutsLink.addEventListener('click', _ => browser.tabs.create({ url: 'chrome://extensions/shortcuts' }))

  controls.disabled.addEventListener('change', e => { saveSettings({ popupDisabled: e.target.checked}) })
  controls.onlyEditable.addEventListener('change', e => { saveSettings({ onlyEditableText: e.target.checked}) })
  controls.disableList.addEventListener('change', e => { controls.disableListSave.classList.remove('saved') })
  controls.disableListSave.addEventListener('click', e => {
    saveSettings({ siteDisableList: controls.disableList.value.split('\n')})
      .then(_ => controls.disableListSave.classList.add('saved'))
  })
}
