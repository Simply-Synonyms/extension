import browser from 'browserApi'

const DEFAULT_SETTINGS = {
  popupDisabled: false,
  onlyEditableText: false,
  siteDisableList: []
}

export function resetSettings() {
  return new Promise((resolve, reject) => {
    browser.storage.local.set({
      extension_options: JSON.stringify(DEFAULT_SETTINGS)
    })
    resolve()
  })
}

export function getSettings() {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(['extension_options'], ({ extension_options }) => {
      resolve(JSON.parse(extension_options))
    })
  })
}

// TODO reject on error
export function saveSettings(newSettings) {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(['extension_options'], ({ extension_options }) => {
      browser.storage.local.set({
        // Merge new settings with old settings and save as a JSON string
        extension_options: JSON.stringify(Object.assign(JSON.parse(extension_options), newSettings))
      })
      resolve()
    })
  })
}