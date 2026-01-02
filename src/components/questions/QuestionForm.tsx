"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LaTeXPreview } from "./LaTeXPreview"

interface Subject {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  order: number
}

interface AnswerOption {
  text: string
  isCorrect: boolean
}

interface QuestionFormProps {
  tutorId: string
}

export function QuestionForm({ tutorId }: QuestionFormProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchCategories(selectedSubject)
    } else {
      setCategories([])
      setSelectedCategory("")
    }
  }, [selectedSubject])

  async function fetchSubjects() {
    try {
      const response = await fetch("/api/subjects")
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects)
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    }
  }

  async function fetchCategories(subjectId: string) {
    try {
      const response = await fetch(`/api/subjects/${subjectId}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  function addAnswerOption() {
    setAnswerOptions([...answerOptions, { text: "", isCorrect: false }])
  }

  function removeAnswerOption(index: number) {
    if (answerOptions.length <= 2) {
      setError("You need at least 2 answer options")
      return
    }
    setAnswerOptions(answerOptions.filter((_, i) => i !== index))
  }

  function updateAnswerOption(index: number, field: keyof AnswerOption, value: string | boolean) {
    const updated = [...answerOptions]
    if (field === "isCorrect" && value === true) {
      // Uncheck all other options
      updated.forEach((opt, i) => {
        opt.isCorrect = i === index
      })
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setAnswerOptions(updated)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!selectedSubject || !selectedCategory) {
      setError("Please select a subject and category")
      return
    }

    if (!questionText.trim()) {
      setError("Please enter a question")
      return
    }

    const filledOptions = answerOptions.filter((opt) => opt.text.trim())
    if (filledOptions.length < 2) {
      setError("Please provide at least 2 answer options")
      return
    }

    const correctAnswers = filledOptions.filter((opt) => opt.isCorrect)
    if (correctAnswers.length === 0) {
      setError("Please mark one answer as correct")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: questionText,
          subjectId: selectedSubject,
          categoryId: selectedCategory,
          tutorId,
          answerOptions: filledOptions.map((opt, index) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: index + 1,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create question")
        return
      }

      setSuccess("Question created successfully!")
      // Reset form
      setQuestionText("")
      setAnswerOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
      setSelectedCategory("")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Subject Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary">
          Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          required
        >
          <option value="">Select a subject...</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={!selectedSubject || categories.length === 0}
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          required
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Question Text */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-text-primary">
            Question Text
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {showPreview ? "Hide" : "Show"} Preview
          </button>
        </div>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          placeholder="Enter question text. Use $ for inline math, $$ for display math. Example: Calculate $\sqrt{16}$"
          className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          required
        />
        {showPreview && questionText && (
          <div className="mt-2 rounded-md border border-border bg-surface-secondary p-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">Preview:</p>
            <LaTeXPreview
              text={questionText}
              subjectName={subjects.find(s => s.id === selectedSubject)?.name}
            />
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Answer Options
        </label>
        <div className="space-y-3">
          {answerOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={() => updateAnswerOption(index, "isCorrect", true)}
                className="mt-2 h-4 w-4"
                title="Mark as correct answer"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateAnswerOption(index, "text", e.target.value)}
                placeholder={`Option ${index + 1} (supports LaTeX: $x^2$)`}
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {answerOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeAnswerOption(index)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAnswerOption}
          className="mt-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          + Add Answer Option
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-error-bg border border-error-border p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-success-bg border border-success-border p-3">
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Creating..." : "Create Question"}
      </button>
    </form>
  )
}
