import browser from 'browserApi'
import { saveSettings, getSettings } from '../shared/settings'

export default function () {
  browser.contextMenus.create({
    title: 'Simply Synonyms Tools',
    id: 'menuParent',
    contexts: ['all'],
  })
  browser.contextMenus.create({
    title: 'Search thesaurus/dictionary',
    id: 'openQuickSearch',
    parentId: 'menuParent',
    contexts: ['all'],
  })
  browser.contextMenus.create({
    title: 'Disable on this site',
    id: 'disableSite',
    parentId: 'menuParent',
    contexts: ['all'],
  })
  browser.contextMenus.create({
    title: 'Enable on this site',
    id: 'enableSite',
    parentId: 'menuParent',
    contexts: ['all'],
    visible: false,
  })
  browser.contextMenus.create({
    title: 'Options',
    id: 'settings',
    parentId: 'menuParent',
    contexts: ['all'],
  })
  browser.contextMenus.create({
    title: 'Help',
    id: 'help',
    parentId: 'menuParent',
    contexts: ['all'],
  })

  /* Context menu handlers */
  browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'openQuickSearch':
        openQuickSearch(tab)
        break
      case 'help':
        browser.tabs.create({ url: browser.runtime.getURL('page/help.html') })
        break
      case 'settings':
        browser.tabs.create({
          url: browser.runtime.getURL('page/settings.html'),
        })
        break
      case 'enableSite':
      case 'disableSite':
        getSettings().then((options) => {
          const siteHost = new URL(tab.url).host
          const doEnable = info.menuItemId === 'enableSite'

          // Remove or add the site to the disable list
          saveSettings({
            siteDisableList: doEnable
              ? options.siteDisableList.filter((site) => site !== siteHost)
              : options.siteDisableList.concat([siteHost]),
          }).then((_) => updateSiteDisableOptionsFromUrl(tab.url))

          browser.tabs.sendMessage(tab.id, {
            action: 'enableDoubleClickPopup',
            enable: doEnable,
          })
        })
        break
    }
  })

  const tabURLs = {}

  function updateSiteDisableOptionsFromUrl(url) {
    getSettings().then(({ siteDisableList }) => {
      const siteHost = new URL(url).host
      const tabDisabled = siteDisableList.includes(siteHost)
      // Switch site enable/disable controls to reflect the current state of the site in the active tab
      browser.contextMenus.update('disableSite', {
        visible: !tabDisabled,
        title: `Disable on ${siteHost}`,
      })
      browser.contextMenus.update('enableSite', {
        visible: tabDisabled,
        title: `Enable on ${siteHost}`,
      })
    })
  }

  // Keep track of the URL in every tab
  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    tabURLs[tabId] = tab.url
    if (tab.active) updateSiteDisableOptionsFromUrl(tab.url) // If the active tab changed update the site disable options
  })

  // Switch tab disable options when active tab changes
  browser.tabs.onActivated.addListener(({ tabId }) => {
    if (!tabURLs[tabId])
      browser.tabs.get(tabId, (tab) => {
        updateSiteDisableOptionsFromUrl(tab.url)
      })
    else updateSiteDisableOptionsFromUrl(tabURLs[tabId])
  })

  /* Keyboard shortcut handlers */
  browser.commands.onCommand.addListener((command, tab) => {
    switch (command) {
      case 'openQuickSearch':
        openQuickSearch(tab)
        break
    }
  })

  function openQuickSearch(tab) {
    if (tab.url === 'chrome://newtab/') {
      browser.tabs.update(tab.id, { url: `https://www.merriam-webster.com/` })
    } else browser.tabs.sendMessage(tab.id, { action: 'openQuickSearch' })
  }
}
