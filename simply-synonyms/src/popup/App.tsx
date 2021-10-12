import React from 'preact'
import browser from 'browserApi'
import { getSettings, saveSettings, UserSettings } from '../lib/settings'
import { Toaster, toast } from 'react-hot-toast'
import { selectRandom } from '../lib/util'
import { is } from '@react-spring/shared'
import { FiSettings } from '@react-icons/all-files/fi/FiSettings'

const greetings = [
  '',
  'Hello!',
  `Let's do some writing!`,
  'Ready to find some great words?',
  'What are we doing next?',
  'Thanks for using Simply Synonyms!',
  'What a beautiful day.',
  `Good afternoon! Or morning! Or evening! I don't know what time it is...`
]

const images = [
  'undraw_Autumn',
  'undraw_lightbulb_moment',
  'undraw_reading_time',
  'undraw_Shared_workspace',
  'undraw_Sunny_day',
  'undraw_Welcome'
]

const greeting = selectRandom(greetings)
const image = selectRandom(images)

const PopupApp = ({ settings }: { settings: UserSettings }) => {
  return (
    <div>
      <Toaster position='bottom-center' />
      <div class="top">
        <h3>Simply Synonyms</h3>
        <label class="switch">
          <input checked={!settings.popupDisabled} type="checkbox" id="disable_switch" onChange={async (e) => {
            const enable = (e.target as HTMLInputElement).checked
            await saveSettings({
              popupDisabled: !enable
            })
            toast(`Simply Synonyms ${enable ? 'enabled' : 'disabled'}`, {
              duration: 1000
            })
          }} />
          <div class="slider"></div>
        </label>
        <div id="version-text">{`V${
          browser.runtime.getManifest().version
        }`}</div>
        <button>
          <FiSettings size={24} />
        </button>
      </div>
      <div class="body">
        {!('update_url' in browser.runtime.getManifest()) && (
          <h3 id="dev-badge">TEST BUILD</h3>
        )}

        <div class='login-home'>
          <img src={`/assets/${image}.svg`} />
          <div class="greeting">{greeting}</div>
          <button class="large">
            Sign In
          </button>
          <button class="large secondary">
            Make an Account
          </button>
        </div>

        <div class="footer">
          <span>
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

      {/* <p>
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
      </p> */}
      {/* <div class="section">
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
      </div> */}
      {/* <div class="section">
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
      </div> */}
    </div>
  )
}

export default PopupApp
