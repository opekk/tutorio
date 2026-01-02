"use client"

import { useEffect, useState } from "react"
import { LaTeXPreview } from "./LaTeXPreview"

interface AnswerOption {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

interface Question {
  id: string
  text: string
  subject: { name: string }
  category: { name: string }
  answerOptions: AnswerOption[]
  createdAt: string
}

interface QuestionListProps {
  tutorId: string
}

export function QuestionList({ tutorId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [tutorId])

  async function fetchQuestions() {
    try {
      const response = await fetch(`/api/questions?tutorId=${tutorId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }
      const data = await response.json()
      setQuestions(data.questions)
    } catch (error) {
      setError("Failed to load questions")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Loading questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-error-bg border border-error-border p-4">
        <p className="text-sm text-error">{error}</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">
          No questions created yet. Use the form to create your first question.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-text-secondary">
        {questions.length} question{questions.length !== 1 ? "s" : ""}
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <div
            key={question.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-surface-secondary transition-colors"
              onClick={() =>
                setExpandedQuestion(
                  expandedQuestion === question.id ? null : question.id
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    <LaTeXPreview text={question.text} subjectName={question.subject.name} />
                  </div>
                  <div className="mt-1 flex gap-2 text-xs text-text-secondary">
                    <span>{question.subject.name}</span>
                    <span>•</span>
                    <span>{question.category.name}</span>
                  </div>
                </div>
                <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                  {expandedQuestion === question.id ? "▼" : "▶"}
                </button>
              </div>
            </div>

            {expandedQuestion === question.id && (
              <div className="border-t border-border p-4 bg-surface-secondary">
                <p className="text-xs font-medium text-text-secondary mb-3">
                  Answer Options:
                </p>
                <div className="space-y-2">
                  {question.answerOptions.map((option, index) => (
                    <div
                      key={option.id}
                      className={`flex items-start gap-2 rounded p-2 text-sm ${
                        option.isCorrect
                          ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <span className="font-medium text-text-secondary">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <div className="flex-1">
                        <LaTeXPreview text={option.text} subjectName={question.subject.name} />
                      </div>
                      {option.isCorrect && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
