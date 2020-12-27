import browser from 'browserApi'

export default function () {
  browser.contextMenus.create({
    title: 'Simply Synonyms Tools',
    id: 'menuParent',
    contexts: ['all']
  })
  browser.contextMenus.create({
    title: 'Search thesaurus/dictionary',
    id: 'openQuickSearch',
    parentId: 'menuParent',
    contexts: ['all']
  })
  browser.contextMenus.create({
    title: 'Disable on this site',
    id: 'disableSite',
    parentId: 'menuParent',
    contexts: ['page']
  })
  browser.contextMenus.create({
    title: 'Help',
    id: 'helpParent',
    parentId: 'menuParent',
    contexts: ['page']
  })
  browser.contextMenus.create({
    title: 'Help',
    id: 'help',
    parentId: 'helpParent',
    contexts: ['page']
  })
  browser.contextMenus.create({
    title: 'Settings and Options',
    id: 'settings',
    parentId: 'helpParent',
    contexts: ['page']
  })
  browser.contextMenus.create({
    title: 'Contact Us',
    id: 'contact',
    parentId: 'helpParent',
    contexts: ['page']
  })

  browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'openQuickSearch':
        if (tab.url === 'chrome://newtab/') {
          browser.tabs.update(tab.id, { url: `https://www.merriam-webster.com/` })
        } else browser.tabs.sendMessage(tab.id, { action: "openQuickSearch" })
        break
      case 'help':
        browser.tabs.create({ url: browser.runtime.getURL('page/help.html')})
        break
      case 'settings':
        browser.tabs.create({ url: browser.runtime.getURL('page/settings.html')})
        break
      case 'contact':
        browser.tabs.create({ url: 'https://synonyms.bweb.app/contact' })
        break
    }
  })
}
