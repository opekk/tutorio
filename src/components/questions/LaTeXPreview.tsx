"use client"

import { InlineMath, BlockMath } from 'react-katex'
import { useTranslations } from 'next-intl'
import 'katex/dist/katex.min.css'

interface LaTeXPreviewProps {
  text: string
  displayMode?: boolean
  subjectName?: string  // Optional subject name to determine if LaTeX should be rendered
}

// Whitelist of subjects that support LaTeX rendering
const LATEX_SUPPORTED_SUBJECTS = [
  'matematyka',
  'mathematics',
  'math',
  // Add more subjects here as needed (e.g., 'physics', 'chemistry', 'biology')
]

function shouldRenderLatex(subjectName?: string): boolean {
  if (!subjectName) {
    // If no subject provided, default to rendering LaTeX (backwards compatibility)
    return true
  }

  const normalizedSubject = subjectName.toLowerCase()
  return LATEX_SUPPORTED_SUBJECTS.some(subject =>
    normalizedSubject.includes(subject)
  )
}

export function LaTeXPreview({ text, displayMode = false, subjectName }: LaTeXPreviewProps) {
  const t = useTranslations('questions')
  const tErrors = useTranslations('errors')

  if (!text) {
    return (
      <div className="text-zinc-400 dark:text-zinc-600 italic text-sm">
        {t('previewWillAppear')}
      </div>
    )
  }

  // If subject doesn't support LaTeX, just render plain text
  if (!shouldRenderLatex(subjectName)) {
    return <div className="prose dark:prose-invert max-w-none">{text}</div>
  }

  try {
    // Parse text to find LaTeX expressions
    // Supports both $...$ for inline and $$...$$ for display mode
    const parts: { type: 'text' | 'inline' | 'block'; content: string }[] = []
    let currentText = text
    let pos = 0

    while (pos < currentText.length) {
      // Look for $$...$$ (block math)
      const blockStart = currentText.indexOf('$$', pos)
      if (blockStart !== -1) {
        // Add text before $$
        if (blockStart > pos) {
          parts.push({ type: 'text', content: currentText.substring(pos, blockStart) })
        }

        const blockEnd = currentText.indexOf('$$', blockStart + 2)
        if (blockEnd !== -1) {
          parts.push({
            type: 'block',
            content: currentText.substring(blockStart + 2, blockEnd)
          })
          pos = blockEnd + 2
          continue
        }
      }

      // Look for $...$ (inline math)
      const inlineStart = currentText.indexOf('$', pos)
      if (inlineStart !== -1 && (inlineStart === 0 || currentText[inlineStart - 1] !== '$')) {
        // Add text before $
        if (inlineStart > pos) {
          parts.push({ type: 'text', content: currentText.substring(pos, inlineStart) })
        }

        const inlineEnd = currentText.indexOf('$', inlineStart + 1)
        if (inlineEnd !== -1) {
          parts.push({
            type: 'inline',
            content: currentText.substring(inlineStart + 1, inlineEnd)
          })
          pos = inlineEnd + 1
          continue
        }
      }

      // No more LaTeX, add remaining text
      parts.push({ type: 'text', content: currentText.substring(pos) })
      break
    }

    return (
      <div className="prose dark:prose-invert max-w-none">
        {parts.map((part, index) => {
          if (part.type === 'block') {
            return (
              <div key={index} className="my-4">
                <BlockMath math={part.content} />
              </div>
            )
          } else if (part.type === 'inline') {
            return <InlineMath key={index} math={part.content} />
          } else {
            return <span key={index}>{part.content}</span>
          }
        })}
      </div>
    )
  } catch (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm">
        {tErrors('latexRenderError', {
          message: error instanceof Error ? error.message : tErrors('unknownError')
        })}
      </div>
    )
  }
}
