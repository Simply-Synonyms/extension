import popupHtml, {wordDivHtml, wordDetailDetailHtml} from './popupHtml'
import api from '../api/synonyms'
import {sendPageInterfaceMessage} from './util/pageInterface'
import browser from 'browserApi'

let currentTab = 'synonyms'
let loadingTextTimeouts = []

const popupElementIds = {
  popup: 'ssyn-popup',
  loader: 'ssyn-loading',
  content: 'ssyn-content',
  resultsText: 'ssyn-results-text',
  synonyms: 'ssyn-synonyms',
  antonyms: 'ssyn-antonyms',
  loadingText: 'ssyn-connecting-text',
  showAntonymsButton: 'ssyn-antonyms-button',
  closeButton: 'ssyn-close-button',
  audioPlayer: 'ssyn-audio'
}

const popup = {}

let closeCallback = () => {} // Callback to call when popup closes; set by openPopup

// Function to add popup to page, store references to all the elements and set up the event listeners
export function initializePopup() {
  const popupDiv = document.createElement('div')
  popupDiv.innerHTML = popupHtml
  document.body.appendChild(popupDiv)

  Object.entries(popupElementIds).forEach(([elementName, elementId]) => {
    popup[elementName] = document.getElementById(elementId)
  })

  const closePopup = () => {
    resetPopup()
    closeCallback() // Call the closeCallback, set by the open function
  }

  popup.closeButton.addEventListener('click', closePopup)
  popup.showAntonymsButton.addEventListener('click', switchTabs)

  document.addEventListener('click', (e) => {
    if (!popup.popup.contains(e.target)) closePopup()
  })
}

// Function to reset synonyms popup and hide it
export function resetPopup() {
  popup.popup.style.display = 'none'
  popup.popup.style.height = ''
  popup.loader.style.display = 'block'
  popup.content.style.display = 'none'
  popup.resultsText.innerHTML = ''
  popup.synonyms.innerHTML = ''
  popup.synonyms.style.display = 'block'
  popup.antonyms.innerHTML = ''
  popup.antonyms.style.display = 'none'
  popup.loadingText.innerText = ''
  popup.showAntonymsButton.innerText = 'Show antonyms'
  currentTab = 'synonyms'

  for (const timeout of loadingTextTimeouts) clearTimeout(timeout)
}

// Function that just returns popup element
export function getPopup () {
  return popup.popup
}

// Function to open popup at specified position (or same position as before)

let popupX
export function openPopup (onCloseCallback, x, y) {
  closeCallback = onCloseCallback // Will get called when popup closes

  if (x && y) {
    popupX = x
    popup.popup.style.left = `${x}px`
    popup.popup.style.top = `${y}px`
  }
  resetPopup()
  popup.popup.style.display = 'block'
  adjustPopupPosition()

  // Set all loading message timeouts
  loadingTextTimeouts.push(setTimeout(() =>  {
    popup.loadingText.innerText = 'Trying to reach synonym servers...'
    loadingTextTimeouts.push(setTimeout(() => {
      popup.loadingText.innerText = 'This is taking longer than usual...'
      loadingTextTimeouts.push(setTimeout(() => {
        popup.loadingText.innerText = 'It looks like there\'s an issue with our servers. Please try again later.'
      }, 20000))
    }, 4000))
  }, 2000))
}

// Switch between popup tabs
export function switchTabs() {
  if (currentTab === 'synonyms') {
    popup.synonyms.style.display = 'none'
    popup.antonyms.style.display = 'block'
    popup.showAntonymsButton.innerText = 'Show synonyms'
    currentTab = 'antonyms'
    adjustPopupPosition()
  } else {
    popup.synonyms.style.display = 'block'
    popup.antonyms.style.display = 'none'
    popup.showAntonymsButton.innerText = 'Show antonyms'
    currentTab = 'synonyms'
  }
}

// Function to set popup status/results text
export function setResultsText (t) {
  popup.resultsText.innerText = t
}

// Function to stop loader and show contents
export function stopLoading () {
  popup.loader.style.display = 'none'
  popup.content.style.display = 'block'
  adjustPopupPosition()
}

const wordDetailClasses = {
  detailSummary: 'ssyn-detail-summary',
  wordHeading: 'ssyn-detail-word',
  offensiveWarning: 'ssyn-detail-offensive',
  pronunciationText: 'ssyn-detail-pronunciation-text',
  pronunciationPlayButton: 'ssyn-detail-play-button',
  definitions: 'ssyn-detail-definitions'
}

class PopupWordDetail {
  constructor(hg, hgIndex) {
    /* Homograph: "each of two or more words spelled the same but not necessarily pronounced the same and having different meanings and origins." */
    this.homograph = hg
    this.hid = hgIndex

    const detailEl = document.createElement('details')
    detailEl.classList.add('ssyn-detail')
    detailEl.innerHTML = wordDetailDetailHtml

    this.element = detailEl // the root word element
    this.el = {} // An object to hold each sub-element
    Object.entries(wordDetailClasses).forEach(([elementName, elementClass]) => {
      this.el[elementName] = detailEl.querySelector(`.${elementClass}`) // This.el is an object containing all important elements in each word div
    })

    this.el.detailSummary.innerText = `${this.hid + 1}. ${hg.word.replaceAll(/\*/g, '')} (${hg.functionalType})`

    this.populateDetail(hg)
  }

  populateDetail(hg) {
    this.el.wordHeading.innerText = hg.word
    if (hg.offensive) this.el.offensive.style.display = 'block'
    if (hg.pronunciation) this.el.pronunciationText.innerText = `pronounced ${hg.pronunciation}`
    if (hg.audio) {
      this.el.pronunciationPlayButton.style.display = 'inline'
      this.el.pronunciationPlayButton.addEventListener('click', _ => {
        browser.runtime.sendMessage(null, { action: 'playAudio', url: hg.audio })
      })
    }
    for (const [i, def] of hg.shortdefs.entries()) {
      const defEl = document.createElement('p')
      defEl.classList.add('ssyn-detail-definition')
      // string.fromcharcode allows to get a letter starting at A for each index
      defEl.innerText = `${String.fromCharCode(97 + i)}. ${def}`

      this.el.definitions.appendChild(defEl)
    }
  }
}

const wordDivClasses = {
  word: 'ssyn-word',
  detailsButton: 'ssyn-word-details-button',
  buttonIcon: 'ssyn-word-details-button-icon',
  details: 'ssyn-word-details',
  content: 'ssyn-word-details-content',
  loading: 'ssyn-word-details-loading',
  statusText: 'ssyn-word-details-status-text'
}

class PopupWord {
  static currentWithDetailsOpen // Word with details popup open (if there is one)

  constructor(word, clickCallback) {
    this.word = word

    const wordEl = document.createElement('div')
    wordEl.classList.add('ssyn-word-container')
    wordEl.innerHTML = wordDivHtml

    this.element = wordEl // the root word element
    this.el = {}
    Object.entries(wordDivClasses).forEach(([elementName, elementClass]) => {
      this.el[elementName] = wordEl.querySelector(`.${elementClass}`) // This.el is an object containing all important elements in each word div
    })

    this.el.word.innerText = word

    this.el.detailsButton.addEventListener('click', e => this.wordDetailsToggle())

    if (typeof clickCallback === 'function') {
      // Add listener to replace editable text with new synonym
      this.element.classList.add('ssyn-clickable')
      this.element.querySelector('.ssyn-word').addEventListener('click', e => clickCallback(word))
    }
  }

  wordDetailsToggle() {
    this.wordDetailsOpen = !this.wordDetailsOpen
    this.el.details.classList.toggle('open')

    // Change open/close icon and add stay-open class to button
    this.el.buttonIcon.classList.add(!this.wordDetailsOpen ? 'ssyn-icon-info' : 'ssyn-close-o')
    this.el.buttonIcon.classList.remove(this.wordDetailsOpen ? 'ssyn-icon-info' : 'ssyn-close-o')
    this.element.classList.toggle('details-button-open')

    if (this.wordDetailsOpen) {
      if (PopupWord.currentWithDetailsOpen) PopupWord.currentWithDetailsOpen.wordDetailsToggle() // if another word details dialog is open, close it.
      if (!this.el.statusText.innerText) this.getWordDetails()
    }

    PopupWord.currentWithDetailsOpen = this.wordDetailsOpen ? this : null
  }

  getWordDetails () {
    const [wordDetailsRequestPromise, onUserCancelledRequest] = api.getWordDetails(this.word)

    wordDetailsRequestPromise
      .then((response) => {
        if (response.homographs) {
          for (const [index, homograph] of response.homographs.entries()) {
            const detail = new PopupWordDetail(homograph, index)
            this.el.content.appendChild(detail.element)
          }
          this.el.statusText.innerText = `Found ${response.homographs.length} homographs for "${this.word}"`
        } else {
          this.el.statusText.innerText = `Couldn't find word details for ${this.word}`
        }
      })
      .catch(err => {
        console.error(err)
        this.el.statusText.innerText = `We couldn't reach our servers. Please try again later.`
      })
      .finally(() => {
        this.el.loading.style.display = 'none';
        this.el.content.style.display = 'block';
      })
  }
}

/* Function to add words to synonyms or antonyms div.
 * definitions: array of target word definitions
 * words: array of arrays of synonyms or antonyms
 * wordType: 'synonyms' or 'antonyms'
 * clickCallback: callback to call when a user clicks on one of the words
 */
export function addWordsToPopup(wordType, definitions, words, clickCallback) {
  const div = wordType === 'synonyms' ? popup.synonyms : popup.antonyms
  for (const [index, def] of definitions.entries()) {
    if (!words[index]) continue
    // Create definition labels
    const defEl = document.createElement('div')
    defEl.classList.add('ssyn-shortdef')
    defEl.classList.add(wordType === 'antonyms' ? 'ssyn-shortdef-ant': 'ssyn-shortdef-syn')
    defEl.innerText = def.toString()
    div.appendChild(defEl)
    // Print out synonyms for each definition
    for (const word of words[index]) {
      div.appendChild(new PopupWord(word, clickCallback).element)
    }
  }
}

// Function to ensure popup fits in screen
export function adjustPopupPosition() {
  const popupEl = popup.popup // alias

  // Adjust height & position
  if (window.innerHeight - 20 - popupEl.offsetTop < popupEl.offsetHeight) {
    // Popup is overflowing on bottom of page
    popupEl.style.top = `${(window.innerHeight  - 40 - popupEl.offsetHeight)}px`
    popupEl.style.left = `${popupEl.offsetLeft + 50}px`
  }
  if (window.innerWidth - 20 - popupEl.offsetLeft < popupEl.offsetWidth) {
    // Popup is overflowing on right side of page
    popupEl.style.left = `${popupEl.offsetLeft - popupEl.offsetWidth - 20}px`
  }
  if (popupEl.offsetHeight > window.innerHeight - 40) {
    // popup is too tall to fit on page, enable scrolling
    popupEl.style.height = `${window.innerHeight - 40}px`
    popupEl.style.top = '20px'
  }
}
