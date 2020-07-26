
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
          const flattenedSynonyms = response.synonyms.flat()
          const synonymsDiv = document.getElementById('ssyn-synonyms')
          synonymsDiv.innerHTML = ''
          for (const syn of flattenedSynonyms) {
            const synEl = document.createElement('div')
            synEl.innerText = syn
            synonymsDiv.appendChild(synEl)
          }
        } else {
          document.getElementById('ssyn-results-text').innerText = `Unable to find synonyms for "${text}"`
        }

        document.getElementById('ssyn-loading').style.display = 'none'
        document.getElementById('ssyn-content').style.display = 'block'
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
