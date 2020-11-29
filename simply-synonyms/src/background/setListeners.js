import chrome from 'browserApi'

export default function setListeners() {
  if ('update_url' in chrome.runtime.getManifest()) chrome.runtime.setUninstallURL('https://forms.gle/5eR4sC3rW9UV93hUA')

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // Set default settings
      chrome.storage.local.set({
        option_popupDisabled: false,
        option_onlyEditableText: false
      }, () => {})
    }
  })
}