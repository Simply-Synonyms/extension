export default `
<div id="ssyn-popup">
    <div class="ssyn-header">
      <button class="ssyn-header-button" id="ssyn-close-button">X</button>
    </div>
    <div id="ssyn-loading">
        <div class="ssyn-spinner">
            <div class="ssyn-double-bounce1"></div>
            <div class="ssyn-double-bounce2"></div>
        </div>
        <p id="ssyn-connecting-text"></p>
    </div>
    <div id="ssyn-content">
        <p id="ssyn-results-text"></p>
        <button class="ssyn-button" id="ssyn-antonyms-button">Show antonyms</button>
        <div class="ssyn-synonyms-div" id="ssyn-synonyms"></div>
        <div class="ssyn-synonyms-div" id="ssyn-antonyms"></div>
    </div>
</div>
`