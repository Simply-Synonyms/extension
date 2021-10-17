import browser from 'browserApi'

export function isLoggedIn (): Promise<boolean> {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({
      action: 'checkIsLoggedIn'
    }, resolve)
  })
}
