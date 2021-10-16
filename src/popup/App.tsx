import React from 'preact'
import browser from 'browserApi'
import { getSettings, saveSettings, UserSettings } from '../lib/settings'
import { Toaster, toast } from 'react-hot-toast'
import { selectRandom } from '../lib/util'
import { FiSettings } from '@react-icons/all-files/fi/FiSettings'
import { FiX } from '@react-icons/all-files/fi/FiX'
import { FiUser } from '@react-icons/all-files/fi/FiUser'
import { useEffect, useRef, useState } from 'preact/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@firebase/auth'

const WEBSITE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://synonyms.bweb.app/'

const greetings = [
  '',
  'Hello!',
  `Let's do some writing!`,
  'Ready to find some great words?',
  'What are we doing next?',
  'Thanks for using Simply Synonyms!',
  'What a beautiful day.',
  `Good afternoon! Or morning! Or evening! I don't know what time it is...`,
]

const images = [
  'undraw_Autumn',
  'undraw_lightbulb_moment',
  'undraw_reading_time',
  'undraw_Shared_workspace',
  'undraw_Sunny_day',
  'undraw_Welcome',
]

const greeting = selectRandom(greetings)
const image = selectRandom(images)

const PopupApp = ({ settings }: { settings: UserSettings }) => {
  const userMenuRef = useRef<HTMLDivElement>()
  const [settingsOpen, _setSettingsOpen] = useState(false)
  const [userMenuOpen, _setUserMenuOpen] = useState(false)

  const setSettingsOpen = (o) => {
    if (userMenuOpen && o) setUserMenuOpen(false)
    _setSettingsOpen(o)
  }

  const setUserMenuOpen = (o) => {
    if (settingsOpen && o) _setSettingsOpen(false)
    _setUserMenuOpen(o)
  }

  const [user, setUser] = useState<User>()

  useEffect(() => {
    browser.runtime.sendMessage(
      {
        action: 'getUser',
      },
      setUser
    )
  }, [])

  const [enableState, setEnableState] = useState(!settings.popupDisabled)

  return (
    <div>
      <Toaster position="bottom-center" />
      <div class="top">
        <h3>Simply Synonyms</h3>
        <label class="switch">
          <input
            checked={enableState}
            type="checkbox"
            id="disable_switch"
            onChange={async (e) => {
              const enable = (e.target as HTMLInputElement).checked
              await saveSettings({
                popupDisabled: !enable,
              })
              setEnableState(enable)
              toast(`Simply Synonyms ${enable ? 'enabled' : 'disabled'}`, {
                duration: 1000,
              })
            }}
          />
          <div class="slider"></div>
        </label>
        <button
          style={{ zIndex: 40 }}
          onClick={() => setSettingsOpen((o) => !o)}
        >
          {settingsOpen ? <FiX size={24} /> : <FiSettings size={24} />}
        </button>
        {user && (
          <button
            style={{ zIndex: 40 }}
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            {userMenuOpen ? <FiX size={24} /> : <FiUser size={24} />}
          </button>
        )}
      </div>

      <motion.div
        class="settings-container"
        variants={{
          open: (height = 300) => ({
            clipPath: `circle(${height * 2 + 200}px at 100% 0px)`,
            transition: {
              type: 'spring',
              stiffness: 30,
              restDelta: 2,
            },
          }),
          closed: {
            clipPath: 'circle(0px at 100% 0px)',
            transition: {
              delay: 0.1,
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
          },
        }}
        animate={settingsOpen ? 'open' : 'closed'}
      >
        <h2>Settings</h2>
        <div class="setting">
          <h3>Disabled Sites</h3>
          <p>
            Simply Synonyms won't work on any of the websites on this list. Add
            one per line.
          </p>
          <textarea rows={5} />
        </div>
      </motion.div>

      {user && <div class="relative">
        <motion.div
          class="user-menu-container"
          ref={userMenuRef}
          variants={{
            open: () => ({
              height: userMenuRef.current.scrollHeight,
            }),
            closed: {
              height: 0,
              // display: 'none'
            },
          }}
          initial="closed"
          animate={userMenuOpen ? 'open' : 'closed'}
        >
          <div class="inner">
            <p>{user.email}</p>
            <button onClick={() => {
              browser.runtime.sendMessage({
                action: 'signOut'
              })
            }}>Sign Out</button>
          </div>
        </motion.div>
      </div>}

      <div class="body">
        {!('update_url' in browser.runtime.getManifest()) && (
          <h3 id="dev-badge">TEST BUILD</h3>
        )}

        <div class="home">
          <img src={`/assets/${image}.svg`} />
          <div class="greeting">{greeting}</div>
          {!user && (
            <>
              <a
                target="_blank"
                class="button large"
                href={WEBSITE + '/app/login'}
              >
                Sign In
              </a>
              <a
                target="_blank"
                class="button large secondary"
                href={WEBSITE + '/app/signup'}
              >
                Make an Account
              </a>
              <p>Creating an account grants access extra features</p>
            </>
          )}
        </div>

        {/* <AnimatePresence>
          {settings && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              class="word-details"
              style={{ position: 'absolute', top: 0, width: '100%' }}
            ></motion.div>
          )}
        </AnimatePresence> */}

        <div class="footer">
          <div id="version-text">{`Simply Synonyms V${
            browser.runtime.getManifest().version
          }`}</div>
          <span>
            <a href="https://synonyms.bweb.app/changelog" target="_blank">
              Change log
            </a>
          </span>
          <span>
            {' '}
            &middot;{' '}
            <a href="https://synonyms.bweb.app/privacy" target="_blank">
              Privacy
            </a>
          </span>
          {/* <span>
            {' '}
            &middot;{' '}
            <a href="/page/help.html" target="_blank">
              Support
            </a>
          </span> */}
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
