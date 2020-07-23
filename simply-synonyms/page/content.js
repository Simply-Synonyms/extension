// const script = document.createElement('script');
// script.setAttribute("type", "module");
// script.setAttribute("src", chrome.extension.getURL('page/main.js'));
// const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
// head.insertBefore(script, head.lastChild);

const popupHtml = `
<div id="popup">
    <div class="definition">The definition of this word is....</div>
    <div class="synonyms">
        SYNONYM
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

document.body.addEventListener('dblclick', (e) => {
  let text = ''
  text = window.getSelection().toString()
  getSynonyms(text)
    .then((response) => {
      alert(response.synonyms.toString())
    })
})

let popupDiv = document.createElement('div')
popupDiv.innerHTML = popupHtml
document.body.appendChild(popupDiv)
