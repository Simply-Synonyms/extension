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