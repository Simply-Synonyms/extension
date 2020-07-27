
const popupHtml = `
<div id="ssyn-popup">
    <div class="ssyn-header">
      <button class="ssyn-header-button" id="ssyn-close-button">X</button>
    </div>
    <div id="ssyn-loading">
        <div class="ssyn-spinner">
            <div class="ssyn-double-bounce1"></div>
            <div class="ssyn-double-bounce2"></div>
        </div>
    </div>
    <div id="ssyn-content">
        <p id="ssyn-results-text">
            
        </p>
        <div id="ssyn-synonyms">
        </div>
    </div>
</div>
`;


function getSynonyms(word) {
  return fetch(`https://simply-synonyms-api.herokuapp.com/api/get-synonyms?word=${word}`)
    .then(response => response.json())
    .then(data => {
      return(data)
    });
}

function resetPopup() {
  document.getElementById('ssyn-popup').style.display = 'none'
  document.getElementById('ssyn-loading').style.display = 'block'
  document.getElementById('ssyn-content').style.display = 'none'
  document.getElementById('ssyn-results-text').innerHTML = ''
  document.getElementById('ssyn-synonyms').innerHTML = ''
  document.getElementById('ssyn-popup').style.height = ''
}

function adjustPopupPosition() {

}

function addExtension() {
  document.body.addEventListener('dblclick', (e) => {
    let text = ''
    text = window.getSelection().toString()
    if (text.length < 2) return

    resetPopup()
    let popup = document.getElementById('ssyn-popup')
    popup.style.display = 'block'
    popup.style.left = `${e.clientX}px`
    popup.style.top = `${e.clientY + 20}px`

    getSynonyms(text)
      .then((response) => {
        if (response.synonyms) {
          const synonymsDiv = document.getElementById('ssyn-synonyms')
          for (const [i, def] of Object.entries(response.shortdefs)) {
            // Create definition labels
            const defEl = document.createElement('div')
            defEl.classList.add('ssyn-shortdef')
            defEl.innerText = def.toString()
            synonymsDiv.appendChild(defEl)
            // Print out synonyms for each definition
            for (const syn of response.synonyms[i]) {
              const synEl = document.createElement('span')
              synEl.innerText = syn
              synonymsDiv.appendChild(synEl)
            }
          }
        } else {
          document.getElementById('ssyn-results-text').innerText = `Unable to find synonyms for "${text}"`
        }

        document.getElementById('ssyn-loading').style.display = 'none'
        document.getElementById('ssyn-content').style.display = 'block'

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
      })
  })

  let popupDiv = document.createElement('div')
  popupDiv.innerHTML = popupHtml
  document.body.appendChild(popupDiv)

  // Handle closing popup on clicking close button, or outside popup
  document.getElementById('ssyn-close-button').addEventListener('mousedown', resetPopup)

  document.addEventListener('click', (e) => {
    if (!document.getElementById('ssyn-popup').contains(e.target)) resetPopup()
  })
}

chrome.storage.local.get(['option_popupDisabled'], (result) => {
  if (!result.option_popupDisabled) addExtension()
})
