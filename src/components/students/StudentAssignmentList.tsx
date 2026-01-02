"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  calculateAssignmentStatus,
  formatDueDate,
  getStatusBadgeClasses,
} from "@/lib/assignmentUtils"

interface Assignment {
  id: string
  title: string
  dueDate: string | null
  createdAt: string
  tutor: {
    id: string
    name: string
  }
  questionCount: number
  answeredCount: number
  correctCount: number
}

interface StudentAssignmentListProps {
  studentId: string
}

export function StudentAssignmentList({
  studentId,
}: StudentAssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAssignments()
  }, [studentId])

  async function fetchAssignments() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/assignments`)
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
      <div className="text-center py-12">
        <p className="text-lg text-text-secondary">
          No assignments yet
        </p>
        <p className="mt-2 text-sm text-text-tertiary">
          Your tutor will assign practice questions for you to complete.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const status = calculateAssignmentStatus(assignment)
        const progressPercent = assignment.questionCount > 0
          ? Math.round((assignment.answeredCount / assignment.questionCount) * 100)
          : 0

        return (
          <Link
            key={assignment.id}
            href={`/dashboard/student/assignments/${assignment.id}`}
            className="block rounded-lg border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-primary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-text-primary">
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
                  <span>By: {assignment.tutor.name}</span>
                  <span>•</span>
                  <span>
                    {assignment.questionCount} question
                    {assignment.questionCount !== 1 ? "s" : ""}
                  </span>
                  {assignment.dueDate && (
                    <>
                      <span>•</span>
                      <span className={status === "overdue" ? "text-error font-medium" : ""}>
                        {formatDueDate(assignment.dueDate)}
                      </span>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-secondary">
                      Progress
                    </span>
                    <span className="font-medium text-text-primary">
                      {assignment.answeredCount}/{assignment.questionCount} answered
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-secondary border border-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {assignment.answeredCount > 0 && (
                    <div className="mt-1 text-xs text-text-tertiary">
                      {assignment.correctCount} correct out of{" "}
                      {assignment.answeredCount} answered (
                      {Math.round(
                        (assignment.correctCount / assignment.answeredCount) * 100
                      )}
                      % accuracy)
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 text-text-tertiary">
                →
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
