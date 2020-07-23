
const popupHtml = `
<div id="popup">
    <div class="header">
      <div>Synonyms:</div>
      <div class="right-button" id="close-button">x</div>
    </div>
    <div class="synonyms" id="synonyms">
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

function addExtension() {
  document.body.addEventListener('dblclick', (e) => {
    let text = ''
    text = window.getSelection().toString()
    getSynonyms(text)
      .then((response) => {
        const flattenedSynonyms = response.synonyms.flat()
        const synonymsDiv = document.getElementById('synonyms')
        synonymsDiv.innerHTML = ''
        for (const syn of flattenedSynonyms) {
          const synEl = document.createElement('div')
          synEl.innerText = syn
          synonymsDiv.appendChild(synEl)
        }
      })
  })

  let popupDiv = document.createElement('div')
  popupDiv.innerHTML = popupHtml
  document.body.appendChild(popupDiv)
}

chrome.storage.local.get(['option_popupDisabled'], (result) => {
  if (!result.option_popupDisabled) addExtension()
})
