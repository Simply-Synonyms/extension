import React from 'preact'
import browser from 'browserApi'
import { getSettings, saveSettings } from '../shared/settings'

const PopupApp: React.FunctionalComponent = () => {
  return (
    <div>
      <h2>Simply Synonyms</h2>
      <h3 id="dev-badge">TEST VERSION</h3>
      <p>
        A simple synonym finder. Double click any word on the page to find a
        definition and synonyms.
      </p>
      <p>
        <i>
          Powered by the{' '}
          <a
            class="no-highlight"
            href="https://dictionaryapi.com/?ref=simply-synonyms"
            target="_blank"
            rel="noopener"
          >
            Merriam-Webster Dictionary API
          </a>
        </i>
      </p>
      <div class="section">
        <p id="user-welcome"></p>
        <div id="signin-div">
          <p>
            Sign in with Google to access additional features, including an
            optional personalized email each week.
          </p>
          <button id="google-signin">Sign in with Google</button>
          <p class="fine-print">
            By signing in, you agree to the{' '}
            <a
              href="https://synonyms.bweb.app/privacy"
              class="no-highlight"
              target="_blank"
            >
              Simply Synonyms Privacy Policy
            </a>
            . You also agree to receive synonym-related informational emails
            from Simply Synonyms, which you can unsubscribe from at any time.
          </p>
        </div>
        <button id="signout">Sign Out</button>
      </div>
      <div class="section">
        <button id="open-quicksearch">Open Quick Thesaurus Search</button>
        <p class="fine-print">
          Tip: Quick search can now be accessed by pressing <code>Alt+S</code>{' '}
          or from the right click menu on any page.
        </p>
      </div>
      <div class="section">
        <h3>Options</h3>
        <div class="control-box">
          <p>
            Disable Simply Synonyms Popup (will take effect after page reload)
          </p>
          <label class="switch">
            <input type="checkbox" id="disable_switch" />
            <span class="slider round"></span>
          </label>
        </div>
        <div class="control-box">
          <a href="/page/settings.html" target="_blank">
            <button>Open Settings</button>
          </a>
        </div>
      </div>

      <div class="footer">
        <span id="version-text">{`V${
          browser.runtime.getManifest().version
        }`}</span>
        <span>
          {' '}
          &middot;{' '}
          <a href="https://synonyms.bweb.app/changelog" target="_blank">
            Change log
          </a>
        </span>
        <span>
          {' '}
          &middot;{' '}
          <a
            href="https://share.clickup.com/l/h/4-10555185-1/c7936bdf33d8baf"
            target="_blank"
          >
            Upcoming features
          </a>
        </span>
        <span>
          {' '}
          &middot;{' '}
          <a href="https://synonyms.bweb.app/privacy" target="_blank">
            Privacy
          </a>
        </span>
        <span>
          {' '}
          &middot;{' '}
          <a href="/page/help.html" target="_blank">
            Support
          </a>
        </span>
        <span>
          {' '}
          &middot;{' '}
          <a href="https://github.com/Simply-Synonyms" target="_blank">
            GitHub
          </a>
        </span>
      </div>
    </div>
  )
}

export default PopupApp
