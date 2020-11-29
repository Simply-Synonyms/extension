import chrome from 'browserApi'
import googleDocsUtil from './siteLibs/googleDocsUtil'
import api from '../api/synonyms'
import { initializePopup, resetPopup, openPopup, getPopup, addWordsToPopup, setResultsText, stopLoading } from './popup'
import './styles.css'

let options = {}

// Function to find selected word, fetch synonyms and open synonym popup.
function processDoubleClick (e, w) {
  // Processes double clicked element, or word provided
  let targetType = null
  if (window.location.hostname === 'docs.google.com') targetType = 'gdoc'
  else if (e.target.hasAttribute('contenteditable')) targetType = 'contenteditable'
  if ([ 'input', 'textarea' ].includes(e.target.nodeName.toLowerCase())) targetType = 'input'

  if (!targetType && options.option_onlyEditableText) return

  let word, selection, googleDoc
  if (targetType === 'gdoc') {
    googleDoc = googleDocsUtil.getGoogleDocument()
    word = googleDoc.selectedText
  } else {
    selection = window.getSelection()
    word = w || selection.toString().trim()
  }
  if (word.length < 2) return

  // Don't set new position if user selected a word within popup
  if (e && !getPopup().contains(e.target)) openPopup(e.clientX, e.clientY)
  else openPopup()

  api.getSynonyms(word)
    .then((response) => {
      if (response.synonyms) {
        // TODO Click callback for contenteditable and gdoc
        const wordClickCallback = targetType !== 'input' ? null : () => {
          e.target.value = e.target.value.slice(0, e.target.selectionStart) + word + e.target.value.slice(e.target.selectionEnd)
          resetPopup()
        }
        addWordsToPopup('synonyms', response.shortdefs, response.synonyms, wordClickCallback)
        addWordsToPopup('antonyms', response.shortdefs, response.antonyms || [], wordClickCallback)
      } else {
        const suffixText = targetType ? 'Are you sure you spelled it correctly?' : '' // Only show this text if the target is editable
        setResultsText(`Unable to find synonyms for "${word}". ${suffixText}`)
      }

      stopLoading()
    })
}

function addExtension() {
  document.body.addEventListener('dblclick', processDoubleClick)

  initializePopup()
}

chrome.storage.local.get(['option_popupDisabled', 'option_onlyEditableText'], (result) => {
  options = result
  if (!result.option_popupDisabled) addExtension()
})