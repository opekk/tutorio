"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LaTeXPreview } from "../questions/LaTeXPreview"
import {
  calculateAssignmentStatus,
  formatDueDate,
  getStatusBadgeClasses,
} from "@/lib/assignmentUtils"

interface Student {
  id: string
  name: string
  email: string
  profileId: string
}

interface Assignment {
  id: string
  title: string
  dueDate: string | null
  createdAt: string
  student: Student
  questionCount: number
  answeredCount: number
  correctCount: number
  questions: Array<{
    id: string
    text: string
    order: number
    subject: { name: string }
    category: { name: string }
    isAnswered: boolean
    isCorrect: boolean | null
  }>
}

interface AssignmentListProps {
  tutorId: string
  onEditAssignment?: (assignmentId: string) => void
}

export function AssignmentList({
  tutorId,
  onEditAssignment,
}: AssignmentListProps) {
  const router = useRouter()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<
    string | null
  >(null)
  const [filterStudentId, setFilterStudentId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<
    string | null
  >(null)

  useEffect(() => {
    fetchAssignments()
    fetchStudents()
  }, [tutorId])

  async function fetchAssignments() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ tutorId })
      if (filterStudentId) params.append("studentProfileId", filterStudentId)

      const response = await fetch(`/api/assignments?${params}`)
      if (!response.ok) throw new Error("Failed to fetch assignments")

      const data = await response.json()
      setAssignments(data.assignments)
      setError("")
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setError("Failed to load assignments")
    } finally {
      setIsLoading(false)
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

  async function deleteAssignment(assignmentId: string, title: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This cannot be undone.`
      )
    ) {
      return
    }

    setDeletingAssignmentId(assignmentId)
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete assignment")

      // Optimistic update
      setAssignments(assignments.filter((a) => a.id !== assignmentId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting assignment:", error)
      alert("Failed to delete assignment. Please try again.")
      fetchAssignments() // Refetch to restore state
    } finally {
      setDeletingAssignmentId(null)
    }
  }

  function handleEdit(assignmentId: string) {
    if (onEditAssignment) {
      onEditAssignment(assignmentId)
    }
  }

  // Client-side filtering
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStudent =
      !filterStudentId || assignment.student.profileId === filterStudentId
    return matchesSearch && matchesStudent
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">
          Loading assignments...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-error-bg border border-error-border p-4">
        <p className="text-sm text-error">{error}</p>
      </div>
    )
  }

  // Empty state
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">
          No assignments created yet. Use the form to create your first
          assignment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Student Filter */}
          <select
            value={filterStudentId}
            onChange={(e) => {
              setFilterStudentId(e.target.value)
              fetchAssignments()
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="">All students</option>
            {students.map((student) => (
              <option key={student.profileId} value={student.profileId}>
                {student.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Count */}
        <div className="text-sm text-text-secondary">
          {filteredAssignments.length} assignment
          {filteredAssignments.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              No assignments found matching your filters.
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const status = calculateAssignmentStatus(assignment)
            const isExpanded = expandedAssignmentId === assignment.id
            const isDeleting = deletingAssignmentId === assignment.id

            return (
              <div
                key={assignment.id}
                className="rounded-lg border border-border bg-surface shadow-sm"
              >
                {/* Header (Clickable) */}
                <div
                  onClick={() =>
                    setExpandedAssignmentId(
                      isExpanded ? null : assignment.id
                    )
                  }
                  className="cursor-pointer p-4 hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {assignment.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                        <span>Student: {assignment.student.name}</span>
                        <span>•</span>
                        <span>
                          {assignment.questionCount} question
                          {assignment.questionCount !== 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>
                          Progress: {assignment.answeredCount}/
                          {assignment.questionCount} answered
                        </span>
                        {assignment.answeredCount > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {assignment.correctCount}/{assignment.answeredCount}{" "}
                              correct
                            </span>
                          </>
                        )}
                      </div>
                      {assignment.dueDate && (
                        <div className="mt-1 text-sm text-text-secondary">
                          {formatDueDate(assignment.dueDate)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-text-tertiary">
                      {isExpanded ? "▼" : "▶"}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-surface-secondary">
                    {/* Questions List */}
                    <div className="mb-4">
                      <h4 className="mb-3 text-sm font-semibold text-text-primary">
                        Questions
                      </h4>
                      <div className="space-y-2">
                        {assignment.questions.map((question) => (
                          <div
                            key={question.id}
                            className="rounded-md border border-border bg-surface p-3"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-medium text-text-primary">
                                {question.order}.
                              </span>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="text-xs text-text-secondary">
                                    {question.subject.name} ›{" "}
                                    {question.category.name}
                                  </span>
                                  {question.isAnswered && (
                                    <span
                                      className={`text-xs font-medium ${
                                        question.isCorrect
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {question.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-text-primary">
                                  <LaTeXPreview
                                    text={
                                      question.text.length > 150
                                        ? question.text.substring(0, 150) +
                                          "..."
                                        : question.text
                                    }
                                    subjectName={question.subject.name}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(assignment.id)
                        }}
                        className="rounded-md bg-surface-tertiary px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAssignment(assignment.id, assignment.title)
                        }}
                        disabled={isDeleting}
                        className="rounded-md bg-error-bg px-4 py-2 text-sm font-medium text-error hover:bg-error-hover border border-error-border disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
