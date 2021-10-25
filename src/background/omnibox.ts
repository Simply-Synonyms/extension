import browser from 'browserApi'
import {
  apiRequest,
  autocompleteSearch,
  getThesaurusData,
  processApiRequest,
} from '../api'
import { WEBSITE_URL } from '../config'
import { shuffleArray } from '../lib/util'

// https://github.com/extend-chrome/clipboard/blob/master/src/index.ts
// Can't use modern clipboard API in background
export const clipboardWriteText = (text: string): Promise<string> =>
  new Promise((resolve, reject) => {
    // Create hidden input with text
    const el = document.createElement('textarea')
    el.value = text
    document.body.append(el)

    // Select the text and copy to clipboard
    el.select()
    const success = document.execCommand('copy')
    el.remove()

    if (!success) reject(new Error('Unable to write to clipboard'))

    resolve(text)
  })

export default function initializeOmniboxShortcut() {
  browser.omnibox.setDefaultSuggestion({
    description:
      '[[synonyms:|antonyms:]?<match>&lt;term&gt;</match> <dim>Search for a term</dim> | <match>open</match> <dim>Open Simply Synonyms</dim>] [<match>&gt;c</match>? <dim>copy to clipboard</dim>]',
  })

  browser.omnibox.onInputChanged.addListener(async (text, suggest) => {
    let suggestions: string[] = []
    if (text.startsWith('synonyms:')) {
      suggestions = shuffleArray(
        (await getThesaurusData(text.split(':')[1].trim())).synonyms?.flat() ||
          []
      )
    } else if (text.startsWith('antonyms:')) {
      suggestions = shuffleArray(
        (await getThesaurusData(text.split(':')[1].trim())).antonyms?.flat() ||
          []
      )
    } else {
      suggestions = (await autocompleteSearch(text)).suggestions
    }

    suggest(
      suggestions.map(w => ({
        content: w,
        description: w,
      }))
    )
  })

  browser.omnibox.onInputEntered.addListener(async (text, disposition) => {
    if (text.trim().endsWith('>c')) {
      clipboardWriteText(text.split('>c')[0])
    } else
      browser.tabs.query({ active: true, currentWindow: true }, async tabs => {
        if (tabs[0].url == 'chrome://newtab/')
          await browser.tabs.update(tabs[0].id, {
            url: WEBSITE_URL,
          })
        else
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'startSearch',
            query: text,
          })
      })
  })
}
