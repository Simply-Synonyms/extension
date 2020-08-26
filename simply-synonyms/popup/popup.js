let onlyEditableText = document.getElementById('only_editable_text_switch')
let disablePopup = document.getElementById('disable_switch')

function settingsChanged() {
  chrome.storage.local.set({
    option_popupDisabled: disablePopup.checked,
    option_onlyEditableText: onlyEditableText.checked
  }, () => {

  })
}

chrome.storage.local.get(['option_popupDisabled', 'option_onlyEditableText'], (result) => {
  disablePopup.checked = result.option_popupDisabled
  onlyEditableText.checked = result.option_onlyEditableText
})


onlyEditableText.addEventListener('click', settingsChanged)
disablePopup.addEventListener('click', settingsChanged)

document.getElementById('version-text').innerText = `V${chrome.runtime.getManifest().version}`

document.getElementById('quicksearch').addEventListener('input', (e) => {
  const quicksearchPrompt = document.getElementById('quicksearch-prompt')
  if (e.target.value.length !== 0) {
    quicksearchPrompt.style.visibility = 'visible'
  } else {
    quicksearchPrompt.style.visibility = 'hidden'
  }
})

document.getElementById('quicksearch').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //   chrome.tabs.sendMessage(tabs[0].id, { action: 'search', word: e.target.value });
    // })
    chrome.tabs.create({ url: `https://www.merriam-webster.com/thesaurus/${encodeURI(e.target.value)}`})
  }
})