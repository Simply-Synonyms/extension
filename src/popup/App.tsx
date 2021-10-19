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
import { WEBSITE_URL } from '../config'

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

      {user && (
        <div class="relative">
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
              <a target="_blank" href={WEBSITE_URL + '/app/account'}>
                <button>Account</button>
              </a>
              <button
                onClick={() => {
                  browser.runtime.sendMessage({
                    action: 'signOut',
                  })
                }}
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                href={WEBSITE_URL + '/app/login'}
              >
                Sign In
              </a>
              <a
                target="_blank"
                class="button large secondary"
                href={WEBSITE_URL + '/app/signup'}
              >
                Make an Account
              </a>
              <p>Creating an account grants access extra features</p>
            </>
          )}
          {user && (
            <>
              <a
                target="_blank"
                class="button large"
                href={WEBSITE_URL + '/app'}
              >
                Open App
              </a>
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
            <a href={WEBSITE_URL + '/changelog'} target="_blank">
              Change log
            </a>
          </span>
          <span>
            {' '}
            &middot;{' '}
            <a href={WEBSITE_URL + '/privacy'} target="_blank">
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
    </div>
  )
}

export default PopupApp
