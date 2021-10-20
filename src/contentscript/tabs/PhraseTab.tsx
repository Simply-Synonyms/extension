import React from 'preact'
import { FiRotateCw } from '@react-icons/all-files/fi/FiRotateCw'
import { useEffect, useState } from 'preact/hooks'
import { RewritePhraseResponse, rewritePhrase } from '../../api'
import { useAccountStatus, useAsyncRequest } from '../../lib/hooks'
import browser from 'browserApi'
import { WEBSITE_URL } from '../../config'

// TODO paid functionality

const PhraseTab: React.FunctionComponent<{
  phrase: string
  onLoad: () => void
  replaceText: (t: string) => void
}> = ({ phrase, onLoad, replaceText }) => {
  const account = useAccountStatus()

  const [rewriteData, rewriting, loadRewrite] =
    useAsyncRequest<RewritePhraseResponse>(
      () => rewritePhrase(phrase),
      `We couldn't rewrite that phrase for you`,
      (res: RewritePhraseResponse, oldData) => {
        return oldData
          ? { newPhrases: oldData.newPhrases.concat(res.newPhrases) }
          : res
      }
    )

  const rewrite = () => {
    loadRewrite(true)
  }

  useEffect(() => {
    onLoad()
  }, [rewriteData])

  return <div class="relative">
      {!account?.premiumActive && <div class="authwall-overlay">
        You need premium to access this feature
        <a class='button' target='_blank' rel='noopener noreferrer' href={WEBSITE_URL + '/premium'}>Learn more</a>
      </div>}
       <div>
         
      <div class="text-box">{phrase}</div>
      <button
        class="button flex-middle"
        style={{ gap: '6px' }}
        onClick={(e) => {
          e.stopPropagation()
          rewrite()
        }}
      >
        <span class={rewriting && 'animate-spin'}>
          <FiRotateCw size={20} />
        </span>
        <span>Rewrite {rewriteData ? 'this again' : 'this'}</span>
      </button>

      {rewriteData?.newPhrases.map((r) => (
        <div
          className="text-box clickable"
          key={r.index}
          onClick={() => { replaceText(r.text) }}
        >
          {r.text}
        </div>
      ))}

      {rewriting && (
        <div class="text-box">
          <strong>thinking...</strong>
        </div>
      )}
       </div>
    </div>
  
}

export default PhraseTab
