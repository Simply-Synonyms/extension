import browser from 'browserApi'

export interface UserSettings {
  popupDisabled: boolean
  /** Only enable popup on editable text */
  onlyEditableText: boolean
  /** List of sites to disable popup on */
  siteDisableList: string[]
}

const DEFAULT_SETTINGS: UserSettings = {
  popupDisabled: false,
  onlyEditableText: true,
  siteDisableList: [],
}

export function resetSettings() {
  return new Promise<void>((resolve, reject) => {
    browser.storage.local.set({
      extension_options: JSON.stringify(DEFAULT_SETTINGS),
    })
    resolve()
  })
}

export function getSettings() {
  return new Promise<UserSettings>((resolve, reject) => {
    browser.storage.local.get(
      ['extension_options'],
      ({ extension_options }) => {
        resolve(JSON.parse(extension_options))
      }
    )
  })
}

// TODO reject on error
export function saveSettings(newSettings: Partial<UserSettings>) {
  return new Promise<void>((resolve, reject) => {
    browser.storage.local.get(
      ['extension_options'],
      ({ extension_options }) => {
        browser.storage.local.set({
          // Merge new settings with old settings and save as a JSON string
          extension_options: JSON.stringify(
            Object.assign(JSON.parse(extension_options), newSettings)
          ),
        })
        resolve()
      }
    )
  })
}
