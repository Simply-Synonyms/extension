let timeoutsToClear = []
let options = {}
let currentTab = 'synonyms'
let loggedIn
let headers = {} // Request headers (for auth)

function getSynonyms(word) {
  word = word.trim()
  if (loggedIn) fetch(`https://us-central1-simply-synonyms-api.cloudfunctions.net/api/update-user-stats`, { headers }) // Increment user's synonym counters
  return fetch(`https://us-central1-simply-synonyms-api.cloudfunctions.net/api/get-thesaurus-data?word=${word}`)
    .then(response => response.json())
    .then(data => {
      return(data)
    });
}


// Function to reset synonyms popup and hide it
function resetPopup() {
  // We have way too many getElementByIds, TODO refactor element references
  document.getElementById('ssyn-popup').style.display = 'none'
  document.getElementById('ssyn-loading').style.display = 'block'
  document.getElementById('ssyn-content').style.display = 'none'
  document.getElementById('ssyn-results-text').innerHTML = ''
  document.getElementById('ssyn-synonyms').innerHTML = ''
  document.getElementById('ssyn-synonyms').style.display = 'block'
  document.getElementById('ssyn-antonyms').innerHTML = ''
  document.getElementById('ssyn-antonyms').style.display = 'none'
  document.getElementById('ssyn-popup').style.height = ''
  document.getElementById('ssyn-connecting-text').innerText = ''
  document.getElementById('ssyn-antonyms-button').innerText = 'Show antonyms'
  currentTab = 'synonyms'

  for (const timeout of timeoutsToClear) clearTimeout(timeout)
}

// Switch between popup tabs
function switchTabs(e) {
  const button = document.getElementById('ssyn-antonyms-button')
  const synonymsDiv = document.getElementById('ssyn-synonyms')
  const antonymsDiv = document.getElementById('ssyn-antonyms')
  if (currentTab === 'synonyms') {
    synonymsDiv.style.display = 'none'
    antonymsDiv.style.display = 'block'
    button.innerText = 'Show synonyms'
    currentTab = 'antonyms'
    adjustPopupPosition()
  } else {
    synonymsDiv.style.display = 'block'
    antonymsDiv.style.display = 'none'
    button.innerText = 'Show antonyms'
    currentTab = 'synonyms'
  }
}

/* Function to add words to synonyms and antonyms div.
 * div: div to add words to
 * target: element with target word
 * targetType: null if it's non-editable, else 'gdoc', 'contenteditable', or 'input'
 * definitions: array of target word definitions
 * words: array of arrays of synonyms or antonyms
 * wordType: 'synonyms' or 'antonyms'
 */
function addWordsToDiv(div, definitions, words, wordType, target, targetType) {
  for (const [i, def] of Object.entries(definitions)) {
    if (!words[i]) continue
    // Create definition labels
    const defEl = document.createElement('div')
    defEl.classList.add('ssyn-shortdef')
    defEl.classList.add(wordType === 'antonyms' ? 'ssyn-shortdef-ant': 'ssyn-shortdef-syn')
    defEl.innerText = def.toString()
    div.appendChild(defEl)
    // Print out synonyms for each definition
    for (const word of words[i]) {
      const synEl = document.createElement('span')
      synEl.innerText = word
      if (targetType === 'input') synEl.classList.add('ssyn-clickable-span')
      div.appendChild(synEl)
      // Add listener to replace editable text with new synonym
      synEl.addEventListener('click', () => {
        switch (targetType) {
          case 'input':
            target.value = target.value.slice(0, target.selectionStart) + word + target.value.slice(target.selectionEnd)
            resetPopup()
            break;
          case 'contenteditable':
            // TODO find contenteditable selection start - still not working :(
            break;
          case 'gdoc':
            // TODO google docs replace word
            break;
        }
      })
    }
  }
}

function adjustPopupPosition() {
  const popup = document.getElementById('ssyn-popup')

  // Adjust height & position
  if (window.innerHeight - 20 - popup.offsetTop < popup.offsetHeight) {
    // Popup is overflowing on bottom of page
    popup.style.top = `${(window.innerHeight  - 20 - popup.offsetHeight)}px`
    popup.style.left = `${popup.offsetLeft + 50}px`
  }
  if (window.innerWidth - 20 - popup.offsetLeft < popup.offsetWidth) {
    // Popup is overflowing on right side of page
    popup.style.left = `${popup.offsetLeft - popup.offsetWidth - 20}px`
  }
  if (popup.offsetHeight > window.innerHeight - 40) {
    // popup is too tall to fit on page, enable scrolling
    popup.style.height = `${window.innerHeight - 40}px`
    popup.style.top = '20px'
  }
}

// Function to find selected word, fetch synonyms and open synonym popup.
function synonyms (e, w) {
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

  const popup = document.getElementById('ssyn-popup')
  // Don't set new position if user selected a word within popup
  if (e && !popup.contains(e.target)) {
    popup.style.left = `${e.clientX}px`
    popup.style.top = `${e.clientY + 20}px`
  } else if (!e) {
    // Set arbitrary position if the word isn't in element target
    popup.style.left = `${window.innerWidth - 1000}px`
    popup.style.top = `100px`
  }
  resetPopup()
  popup.style.display = 'block'
  adjustPopupPosition()

  // Set all connecting message timeouts
  timeoutsToClear.push(setTimeout(() =>  {
    let t = document.getElementById('ssyn-connecting-text')
    t.innerText = 'Trying to reach synonym servers...'
    timeoutsToClear.push(setTimeout(() => {
      t.innerText = 'This is taking longer than usual...'
      timeoutsToClear.push(setTimeout(() => {
        t.innerText = 'It looks like there\'s an issue with our servers. Please try again later.'
      }, 20000))
    }, 4000))
  }, 2000))

  getSynonyms(word)
    .then((response) => {
      if (response.synonyms) {
        const synonymsDiv = document.getElementById('ssyn-synonyms')
        const antonymsDiv = document.getElementById('ssyn-antonyms')
        addWordsToDiv(synonymsDiv, response.shortdefs, response.synonyms, 'synonyms', e.target, targetType)
        addWordsToDiv(antonymsDiv, response.shortdefs, response.antonyms || [], 'antonyms', e.target, targetType)
      } else {
        const suffixText = targetType ? 'Are you sure you spelled it correctly?' : ''
        document.getElementById('ssyn-results-text').innerText = `Unable to find synonyms for "${word}". ${suffixText}`
      }

      document.getElementById('ssyn-loading').style.display = 'none'
      document.getElementById('ssyn-content').style.display = 'block'

      adjustPopupPosition()
    })
}

// Add popup HTML and event listeners to page
function addExtension() {

  document.body.addEventListener('dblclick', synonyms)

  let popupDiv = document.createElement('div')
  popupDiv.innerHTML = popupHtml
  document.body.appendChild(popupDiv)

  // Handle closing popup on clicking close button, or outside popup
  document.getElementById('ssyn-close-button').addEventListener('click', resetPopup)

  // Handle switching between synonyms and antonyms
  document.getElementById('ssyn-antonyms-button').addEventListener('click', switchTabs)

  document.addEventListener('click', (e) => {
    if (!document.getElementById('ssyn-popup').contains(e.target)) resetPopup()
  })
}


chrome.storage.local.get(['option_popupDisabled', 'option_onlyEditableText'], (result) => {
  options = result
  if (!result.option_popupDisabled) addExtension()
})

chrome.storage.local.get(['idToken'], ({ idToken }) => {
  loggedIn = !!idToken
  if (idToken) headers = new Headers({
    'Authorization': `Bearer ${idToken}`
  })
})

// chrome.runtime.onMessage.addListener((message, sender, respond) => {
//   if (message.action === 'search' && message.word) {
//     getSynonyms()
//       .then(res => respond(res))
//   }
// })