"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LaTeXPreview } from "../questions/LaTeXPreview"

interface Subject {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  email: string
  profileId: string
}

interface Question {
  id: string
  text: string
  subject: { name: string }
  category: { name: string }
}

interface AssignmentFormProps {
  tutorId: string
  assignmentId?: string | null
  onAssignmentCreated?: () => void
  onEditComplete?: () => void
}

function SortableQuestion({
  question,
  index,
  onRemove,
}: {
  question: Question
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getSubjectBadgeClass = (subjectName: string) => {
    const subject = subjectName.toLowerCase()
    if (subject.includes('matemat')) return 'badge-math'
    if (subject.includes('polski')) return 'badge-polish'
    if (subject.includes('english') || subject.includes('angielski')) return 'badge-english'
    return 'bg-surface-tertiary text-text-secondary border border-border'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-border bg-surface p-3"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-text-tertiary hover:text-text-secondary active:cursor-grabbing"
          title="Drag to reorder"
        >
          ☰
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium text-text-primary">
                  {index + 1}.
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getSubjectBadgeClass(question.subject.name)}`}>
                  {question.subject.name}
                </span>
                <span className="text-xs text-text-tertiary">›</span>
                <span className="text-xs text-text-secondary">{question.category.name}</span>
              </div>
              <div className="text-sm text-text-secondary">
                <LaTeXPreview
                  text={
                    question.text.length > 100
                      ? question.text.substring(0, 100) + "..."
                      : question.text
                  }
                  subjectName={question.subject.name}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(question.id)}
              className="ml-2 rounded px-2 py-1 text-xs font-medium text-error hover:bg-error-bg"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssignmentForm({
  tutorId,
  assignmentId = null,
  onAssignmentCreated,
  onEditComplete,
}: AssignmentFormProps) {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState("")
  const [dueDate, setDueDate] = useState("")

  // Data state
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // UI state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const isEditMode = !!assignmentId

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchStudents()
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

  useEffect(() => {
    if (selectedSubject || selectedCategory) {
      fetchQuestions()
    } else {
      setAvailableQuestions([])
    }
  }, [selectedSubject, selectedCategory])

  // Fetch assignment data if in edit mode
  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData(assignmentId)
    }
  }, [assignmentId])

  async function fetchAssignmentData(id: string) {
    try {
      const response = await fetch(`/api/assignments/${id}`)
      if (!response.ok) throw new Error("Failed to fetch assignment")

      const data = await response.json()
      const assignment = data.assignment

      setTitle(assignment.title)
      setSelectedStudentProfileId(assignment.student.profileId)
      setDueDate(
        assignment.dueDate ? assignment.dueDate.split("T")[0] : ""
      )

      // Set selected questions with full question data
      setSelectedQuestions(
        assignment.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          subject: q.subject,
          category: q.category,
        }))
      )
    } catch (error) {
      console.error("Error fetching assignment:", error)
      setError("Failed to load assignment")
    }
  }

  async function fetchStudents() {
    try {
      const response = await fetch(`/api/tutors/${tutorId}/students`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

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

  async function fetchQuestions() {
    setIsLoadingQuestions(true)
    try {
      const params = new URLSearchParams({ tutorId })
      if (selectedSubject) params.append("subjectId", selectedSubject)
      if (selectedCategory) params.append("categoryId", selectedCategory)

      const response = await fetch(`/api/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableQuestions(data.questions)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  function addQuestion(question: Question) {
    if (selectedQuestions.find((q) => q.id === question.id)) {
      setError("Question already added to assignment")
      return
    }
    setSelectedQuestions([...selectedQuestions, question])
    setError("")
  }

  function removeQuestion(questionId: string) {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!title.trim()) {
      setError("Please enter an assignment title")
      return
    }

    if (!selectedStudentProfileId) {
      setError("Please select a student")
      return
    }

    if (selectedQuestions.length === 0) {
      setError("Please select at least 1 question")
      return
    }

    // Warn about past due date but allow
    if (dueDate && new Date(dueDate) < new Date()) {
      // Just a warning, not blocking
    }

    setIsLoading(true)

    try {
      const url = isEditMode
        ? `/api/assignments/${assignmentId}`
        : "/api/assignments"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          studentProfileId: selectedStudentProfileId,
          questionIds: selectedQuestions.map((q) => q.id),
          dueDate,
          ...(!isEditMode && { tutorId }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `Failed to ${isEditMode ? "update" : "create"} assignment`)
        return
      }

      setSuccess(`Assignment ${isEditMode ? "updated" : "created"} successfully!`)

      if (isEditMode) {
        onEditComplete?.()
      } else {
        // Reset form for create mode
        setTitle("")
        setSelectedStudentProfileId("")
        setDueDate("")
        setSelectedQuestions([])
        setSelectedSubject("")
        setSelectedCategory("")
        onAssignmentCreated?.()
      }

      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check for edge cases
  const hasStudents = students.length > 0
  const hasQuestions = availableQuestions.length > 0 || selectedQuestions.length > 0
  const isPastDueDate = dueDate && new Date(dueDate) < new Date()

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary">
          Assignment Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Week 1 Practice Problems"
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          required
        />
      </div>

      {/* Student Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary">
          Assign To Student
        </label>
        {!hasStudents ? (
          <div className="mt-1 rounded-md border border-border bg-surface-secondary p-3">
            <p className="text-sm text-text-secondary">
              No students added yet. Please add students first in the{" "}
              <a
                href="/dashboard/students"
                className="font-medium text-primary hover:underline"
              >
                Students
              </a>{" "}
              page.
            </p>
          </div>
        ) : (
          <select
            value={selectedStudentProfileId}
            onChange={(e) => setSelectedStudentProfileId(e.target.value)}
            disabled={isEditMode}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            required
          >
            <option value="">Select a student...</option>
            {students.map((student) => (
              <option key={student.profileId} value={student.profileId}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        )}
        {isEditMode && (
          <p className="mt-1 text-xs text-text-tertiary">
            Cannot change student for existing assignment
          </p>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-text-primary">
          Due Date (Optional)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        />
        {isPastDueDate && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            ⚠ This date is in the past. Assignment will be marked as overdue.
          </p>
        )}
      </div>

      {/* Question Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Select Questions
        </label>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              <option value="">All subjects...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedSubject || categories.length === 0}
              className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="">All categories...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Questions */}
        {isLoadingQuestions ? (
          <div className="rounded-md border border-border p-4 text-center">
            <p className="text-sm text-text-secondary">
              Loading questions...
            </p>
          </div>
        ) : availableQuestions.length === 0 ? (
          <div className="rounded-md border border-border p-4 text-center">
            <p className="text-sm text-text-secondary">
              No questions available. Please create questions first in the{" "}
              <a
                href="/dashboard/questions"
                className="font-medium text-primary hover:underline"
              >
                Questions
              </a>{" "}
              page.
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border p-3">
            {availableQuestions.map((question) => {
              const isSelected = selectedQuestions.find(
                (q) => q.id === question.id
              )
              return (
                <div
                  key={question.id}
                  className="flex items-start justify-between gap-3 rounded border border-border bg-surface p-2"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        {question.subject.name} › {question.category.name}
                      </span>
                    </div>
                    <div className="text-sm text-text-primary">
                      <LaTeXPreview
                        text={
                          question.text.length > 80
                            ? question.text.substring(0, 80) + "..."
                            : question.text
                        }
                        subjectName={question.subject.name}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addQuestion(question)}
                    disabled={!!isSelected}
                    className="rounded px-3 py-1 text-xs font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSelected ? "Added" : "Add"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Questions (Drag-and-Drop) */}
      {selectedQuestions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Selected Questions ({selectedQuestions.length})
          </label>
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {selectedQuestions.map((question, index) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    index={index}
                    onRemove={removeQuestion}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !hasStudents}
        className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading
          ? `${isEditMode ? "Updating" : "Creating"}...`
          : isEditMode
          ? "Update Assignment"
          : "Create Assignment"}
      </button>
    </form>
  )
}
