"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LaTeXPreview } from "../questions/LaTeXPreview"

interface AnswerOption {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

interface Question {
  id: string
  text: string
  order: number
  subject: { name: string }
  category: { name: string }
  answerOptions: AnswerOption[]
  studentAnswer: {
    answerOptionId: string | null
    isCorrect: boolean | null
    attemptedAt: string
  } | null
}

interface Assignment {
  id: string
  title: string
  dueDate: string | null
  tutor: { name: string }
  questions: Question[]
}

interface AssignmentQuestionsProps {
  studentId: string
  assignmentId: string
}

export function AssignmentQuestions({
  studentId,
  assignmentId,
}: AssignmentQuestionsProps) {
  const router = useRouter()

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, { isCorrect: boolean; shown: boolean }>>({})

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  async function fetchAssignment() {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/students/${studentId}/assignments/${assignmentId}`
      )
      if (!response.ok) throw new Error("Failed to fetch assignment")

      const data = await response.json()
      setAssignment(data.assignment)

      // Pre-populate selected answers from existing student answers
      const preselected: Record<string, string> = {}
      data.assignment.questions.forEach((q: Question) => {
        if (q.studentAnswer?.answerOptionId) {
          preselected[q.id] = q.studentAnswer.answerOptionId
        }
      })
      setSelectedAnswers(preselected)

      setError("")
    } catch (error) {
      console.error("Error fetching assignment:", error)
      setError("Failed to load assignment")
    } finally {
      setIsLoading(false)
    }
  }

  async function submitAnswer(questionId: string) {
    const answerOptionId = selectedAnswers[questionId]
    if (!answerOptionId) {
      alert("Please select an answer first")
      return
    }

    setSubmittingQuestionId(questionId)
    try {
      const response = await fetch(
        `/api/students/${studentId}/assignments/${assignmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            answerOptionId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to submit answer")
        return
      }

      // Show feedback
      setFeedback({
        ...feedback,
        [questionId]: { isCorrect: data.isCorrect, shown: true },
      })

      // Refresh assignment to update student answers
      await fetchAssignment()

      // Auto-hide feedback after 3 seconds
      setTimeout(() => {
        setFeedback((prev) => ({
          ...prev,
          [questionId]: { ...prev[questionId], shown: false },
        }))
      }, 3000)
    } catch (error) {
      console.error("Error submitting answer:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSubmittingQuestionId(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">
          Loading assignment...
        </p>
      </div>
    )
  }

  // Error state
  if (error || !assignment) {
    return (
      <div className="rounded-md bg-error-bg border border-error-border p-4">
        <p className="text-sm text-error">
          {error || "Assignment not found"}
        </p>
      </div>
    )
  }

  const totalQuestions = assignment.questions.length
  const answeredQuestions = assignment.questions.filter(
    (q) => q.studentAnswer !== null
  ).length
  const correctAnswers = assignment.questions.filter(
    (q) => q.studentAnswer?.isCorrect === true
  ).length

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-text-primary">
          {assignment.title}
        </h2>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-secondary">
          <span>By: {assignment.tutor.name}</span>
          <span>•</span>
          <span>
            {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
          </span>
          {assignment.dueDate && (
            <>
              <span>•</span>
              <span>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>

        {/* Progress Summary */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-surface-secondary border border-border p-3">
            <p className="text-sm text-text-secondary">
              Progress
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {answeredQuestions}/{totalQuestions}
            </p>
          </div>
          <div className="rounded-md bg-success-bg border border-success-border p-3">
            <p className="text-sm text-success">
              Correct
            </p>
            <p className="text-2xl font-bold text-success">
              {correctAnswers}
            </p>
          </div>
          <div className="rounded-md bg-info-bg border border-info-border p-3">
            <p className="text-sm text-info">
              Accuracy
            </p>
            <p className="text-2xl font-bold text-info">
              {answeredQuestions > 0
                ? Math.round((correctAnswers / answeredQuestions) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {assignment.questions.map((question) => {
          const isAnswered = question.studentAnswer !== null
          const selectedAnswer = selectedAnswers[question.id]
          const isSubmitting = submittingQuestionId === question.id
          const showFeedback = feedback[question.id]?.shown

          return (
            <div
              key={question.id}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm"
            >
              {/* Question Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-text-secondary">
                      Question {question.order}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {question.subject.name} › {question.category.name}
                    </span>
                  </div>
                  <div className="text-lg text-text-primary">
                    <LaTeXPreview text={question.text} subjectName={question.subject.name} />
                  </div>
                </div>
                {isAnswered && (
                  <span
                    className={`ml-4 rounded-full px-3 py-1 text-sm font-medium ${
                      question.studentAnswer?.isCorrect
                        ? "bg-success-bg text-success border border-success-border"
                        : "bg-error-bg text-error border border-error-border"
                    }`}
                  >
                    {question.studentAnswer?.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {question.answerOptions.map((option) => {
                  const isSelected = selectedAnswer === option.id
                  const wasSelected =
                    isAnswered &&
                    question.studentAnswer?.answerOptionId === option.id

                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-info-bg shadow-sm"
                          : wasSelected && question.studentAnswer?.isCorrect
                          ? "border-success bg-success-bg"
                          : wasSelected && !question.studentAnswer?.isCorrect
                          ? "border-error bg-error-bg"
                          : "border-border hover:border-primary hover:bg-surface-secondary"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) =>
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [question.id]: e.target.value,
                          })
                        }
                        className="mt-1 h-4 w-4 text-primary"
                      />
                      <div className="flex-1 text-sm text-text-primary">
                        <LaTeXPreview text={option.text} subjectName={question.subject.name} />
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div
                  className={`mt-4 rounded-md border p-3 ${
                    feedback[question.id].isCorrect
                      ? "bg-success-bg border-success-border"
                      : "bg-error-bg border-error-border"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      feedback[question.id].isCorrect
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {feedback[question.id].isCorrect
                      ? "✓ Correct! Well done!"
                      : "✗ Incorrect. Try reviewing the material and try again."}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  onClick={() => submitAnswer(question.id)}
                  disabled={!selectedAnswer || isSubmitting}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : isAnswered
                    ? "Change Answer"
                    : "Submit Answer"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
