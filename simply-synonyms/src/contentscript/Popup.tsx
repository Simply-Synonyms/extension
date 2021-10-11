import { forwardRef } from 'preact/compat'
import api from '../api'
import {
  sendPageInterfaceMessage,
  onPageInterfaceMessage,
} from './util/pageInterface'
import { useEffect, useState } from 'preact/hooks'

const AppPopup = forwardRef<
  HTMLDivElement,
  {
    word: string
    open: boolean
    position: [x: number, y: number]
  }
>(({ word, position, open }, ref) => {
  const [tab, setTab] = useState<'synonyms' | 'antonyms' | 'definition'>('synonyms')

  const [synonymRequestPromise, onUserCancelledRequest] = api.getSynonyms(word)

  useEffect(() => {

  }, [word, open])

  // synonymRequestPromise
  //   .then((response) => {
  //     if (response.synonyms) {
  //       // TODO Click callback for contenteditable and gdoc
  //       const onChooseReplacementWord =
  //         targetType !== 'input' && targetType !== 'gdoc'
  //           ? null
  //           : (wordChosen) => {
  //               switch (targetType) {
  //                 case 'input':
  //                   // Replace input text with a new string containing the chosen word
  //                   e.target.value =
  //                     e.target.value.slice(0, e.target.selectionStart) +
  //                     wordChosen +
  //                     e.target.value.slice(e.target.selectionEnd)
  //                   break
  //                 case 'gdoc':
  //                   // Replace selected word by typing out letters in new word
  //                   for (let i = 0; i < wordChosen.length; i++) {
  //                     sendPageInterfaceMessage('simulateGoogleDocKeypress', {
  //                       key: wordChosen[i],
  //                     })
  //                   }
  //               }
  //               resetPopup()
  //             }
  //       addWordsToPopup(
  //         'synonyms',
  //         response.shortdefs,
  //         response.synonyms,
  //         onChooseReplacementWord
  //       )
  //       addWordsToPopup(
  //         'antonyms',
  //         response.shortdefs,
  //         response.antonyms || [],
  //         onChooseReplacementWord
  //       )
  //     } else {
  //       const suffixText = targetType
  //         ? 'Are you sure you spelled it correctly?'
  //         : '' // Only show this text if the target is editable
  //       setResultsText(`Unable to find synonyms for "${word}". ${suffixText}`)
  //     }
  //   })
  //   .catch((err) => {
  //     console.error(err)
  //     setResultsText(
  //       `An error occurred and we couldn't reach our servers. Please try again later.`
  //     )
  //   })
  //   .finally(() => {
  //     stopLoading()
  //   })

  // adjustPopupPosition()

  // // Set all loading message timeouts
  // loadingTextTimeouts.push(
  //   setTimeout(() => {
  //     popup.loadingText.innerText = 'Trying to reach synonym servers...'
  //     loadingTextTimeouts.push(
  //       setTimeout(() => {
  //         popup.loadingText.innerText = 'This is taking longer than usual...'
  //         loadingTextTimeouts.push(
  //           setTimeout(() => {
  //             popup.loadingText.innerText =
  //               "It looks like there's an issue with our servers. Please try again later."
  //           }, 20000)
  //         )
  //       }, 4000)
  //     )
  //   }, 2000)
  // )

  return (
    <>
      {open && (
        <div
          ref={ref}
          id="ssyne-popup"
          style={{
            left: position[0],
            top: position[1],
          }}
        >
          <div class="header">
            {/* <button class="header-button close-button" title="close">
              <i class="icon-close-x"></i>
            </button> */}
          </div>
          {/* <div class="loading">
            <div class="spinner">
              <div class="double-bounce1"></div>
              <div class="double-bounce2"></div>
            </div>
            <p class="connecting-text"></p>
          </div> */}
          <div class="tabs">
              <button>Synonyms</button>
              <button>Antonyms</button>
              <button>Definition</button>
            </div>
          <div class="content">
            <p class="results-text">{

            }</p>
            <div>

            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default AppPopup
