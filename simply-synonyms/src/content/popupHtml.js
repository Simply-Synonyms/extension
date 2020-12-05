export default `
<div id="ssyn-popup">
    <audio id="ssyn-audio-player" style="display: none;" type="audio/mp3"></audio>
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

export const wordDivHtml = `
  <span class="ssyn-word"></span>
  <span class="ssyn-word-details-hover-container">
    <span class="ssyn-word-details-button">
      <i class="ssyn-word-details-button-icon ssyn-icon-info"></i>
    </span>
  </span>
  <div class="ssyn-word-details-container">
    <div class="ssyn-word-details">
      <div class="ssyn-word-details-loading">
        <div class="ssyn-folding-cube">
          <div class="ssyn-cube1 ssyn-sk-cube"></div>
          <div class="ssyn-cube2 ssyn-sk-cube"></div>
          <div class="ssyn-cube4 ssyn-sk-cube"></div>
          <div class="ssyn-cube3 ssyn-sk-cube"></div>
        </div>
        <p class="ssyn-word-details-connecting-text">Loading word data...</p>
      </div>
      <div class="ssyn-word-details-content">
        <p class="ssyn-word-details-status-text"></p>
        
      </div>
    </div>
  </div>
`

export const wordDetailDetailHtml = `
  <summary class="ssyn-detail-summary"></summary>
  <div>
    <h4 class="ssyn-detail-word"></h4>
    <p class="ssyn-detail-offensive">This word may offend some people.</p>
    <div class="ssyn-detail-pronunciation">
        <span class="ssyn-detail-pronunciation-text"></span>
        <span class="ssyn-detail-play-button"> (Play recording)</span>
    </div>
    <div class="ssyn-detail-definitions">
    
    </div>
    <hr/>
  </div>
`
