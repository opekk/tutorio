/**
 * Utility functions for assignment management
 */

export type AssignmentStatus = "active" | "completed" | "overdue"

export interface AssignmentWithProgress {
  dueDate: string | null
  questionCount: number
  answeredCount: number
}

/**
 * Calculate assignment status based on due date and progress
 */
export function calculateAssignmentStatus(
  assignment: AssignmentWithProgress
): AssignmentStatus {
  // Completed if all questions answered
  if (assignment.answeredCount === assignment.questionCount) {
    return "completed"
  }

  // Overdue if due date passed and not all questions answered
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return "overdue"
  }

  // Otherwise active
  return "active"
}

/**
 * Format due date with relative time description
 */
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return "No due date"
  }

  const date = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`
  }
  if (diffDays === 0) {
    return "Due today"
  }
  if (diffDays === 1) {
    return "Due tomorrow"
  }
  return `Due in ${diffDays} days`
}

/**
 * Get status badge color classes
 */
export function getStatusBadgeClasses(status: AssignmentStatus): string {
  switch (status) {
    case "completed":
      return "bg-success-bg text-success border border-success-border"
    case "overdue":
      return "bg-error-bg text-error border border-error-border"
    case "active":
      return "bg-info-bg text-info border border-info-border"
  }
}
