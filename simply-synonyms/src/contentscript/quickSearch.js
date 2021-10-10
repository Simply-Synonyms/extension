import popupHtml from './html/quickSearchHtml'
import browser from 'browserApi'

const popup = {} // Popup elements

const qsPopup = {
  isOpen: false,
  searchDictionary: false,
  dictionaryProvider: 'webster',
  initialize() {
    const popupDiv = document.createElement('div')
    popupDiv.innerHTML = popupHtml
    document.body.appendChild(popupDiv)

    popup.popup = document.getElementById('ssyne-qs-popup')
    popup.input = popup.popup.querySelector('input')
    popup.enterPrompt = popup.popup.querySelector('.press-enter-prompt')
    popup.searchSelect = popup.popup.querySelector('.search-select')
    popup.providerSelect = popup.popup.querySelector('.provider-select')

    // Show "press enter" prompt when user starts typing
    popup.input.addEventListener('input', (e) => {
      if (e.target.value.length !== 0) {
        popup.enterPrompt.style.visibility = 'visible'
      } else {
        popup.enterPrompt.style.visibility = 'hidden'
      }
    })

    // Open search when user presses enter
    popup.popup.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.isOpen) {
        browser.runtime.sendMessage(null, {
          action: 'doQuickSearch',
          dictionaryProvider: this.dictionaryProvider,
          searchDictionary: this.searchDictionary,
          word: popup.input.value,
        })
        this.reset()
      }
    })

    // Switch between thesaurus and dictionary
    popup.searchSelect.addEventListener('change', (e) => {
      this.searchDictionary = e.target.value === 'dictionary'
    })
    // Switch between dictionary providers
    popup.providerSelect.addEventListener('change', (e) => {
      this.dictionaryProvider = e.target.value
    })

    // Close popup
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.reset()
    })
    document.addEventListener('click', (e) => {
      if (!popup.popup.contains(e.target)) this.reset()
    })
  },
  reset() {
    popup.popup.style.display = 'none'
    popup.input.value = ''
    popup.enterPrompt.style.visibility = 'hidden'
    this.isOpen = false
  },
  open(x = window.innerWidth / 2 - 150, y = window.innerHeight / 2 - 100) {
    popup.popup.style.display = 'block'
    popup.popup.style.left = `${x}px`
    popup.popup.style.top = `${y}px`

    popup.input.focus()
    this.isOpen = true
  },
}

export default qsPopup
