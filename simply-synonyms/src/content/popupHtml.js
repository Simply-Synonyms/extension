export default `
<div id="ssyne-popup">
    <audio id="audio-player" style="display: none;" type="audio/mp3"></audio>
    <div class="header">
      <button class="header-button" id="close-button">X</button>
    </div>
    <div id="loading">
        <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
        </div>
        <p id="connecting-text"></p>
    </div>
    <div id="content">
        <p id="results-text"></p>
        <button class="button" id="antonyms-button">Show antonyms</button>
        <div class="synonyms-div" id="synonyms"></div>
        <div class="synonyms-div" id="antonyms"></div>
    </div>
</div>
`

export const wordDivHtml = `
  <span class="word"></span>
  <span class="word-details-hover-container">
    <span class="word-details-button">
      <i class="word-details-button-icon icon-info"></i>
    </span>
  </span>
  <div class="word-details-container">
    <div class="word-details">
      <div class="word-details-loading">
        <div class="folding-cube">
          <div class="cube1 sk-cube"></div>
          <div class="cube2 sk-cube"></div>
          <div class="cube4 sk-cube"></div>
          <div class="cube3 sk-cube"></div>
        </div>
        <p class="word-details-connecting-text">Loading word data...</p>
      </div>
      <div class="word-details-content">
        <p class="word-details-status-text"></p>
        
      </div>
    </div>
  </div>
`

export const wordDetailDetailHtml = `
  <summary class="detail-summary"></summary>
  <div>
    <h4 class="detail-word"></h4>
    <p class="detail-offensive">This word may offend some people.</p>
    <div class="detail-pronunciation">
        <span class="detail-pronunciation-text"></span>
        <span class="detail-play-button"> (Play recording)</span>
    </div>
    <div class="detail-definitions">
    
    </div>
    <hr/>
  </div>
`
