import Preact from 'preact'
import { FiRotateCw } from '@react-icons/all-files/fi/FiRotateCw'
import { useEffect, useState } from 'preact/hooks'
import { RewritePhraseResponse, rewritePhrase } from '../../api'
import { useApiRequest } from '../../lib/hooks'

// TODO paid functionality

const PhraseTab: Preact.FunctionComponent<{
  phrase: string
  onLoad: () => void
  replaceText: (t: string) => void
}> = ({ phrase, onLoad, replaceText }) => {
  const [rewriteData, rewriting, loadRewrite] =
    useApiRequest<RewritePhraseResponse>(
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

  return (
    <>
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
          class="text-box clickable"
          key={r.index}
          onClick={() => replaceText(r.text)}
        >
          {r.text}
        </div>
      ))}

      {rewriting && (
        <div class="text-box">
          <strong>thinking...</strong>
        </div>
      )}
    </>
  )
}

export default PhraseTab
