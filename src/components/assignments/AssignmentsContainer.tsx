"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { AssignmentForm } from "./AssignmentForm"
import { AssignmentList } from "./AssignmentList"

interface AssignmentsContainerProps {
  tutorId: string
}

export function AssignmentsContainer({ tutorId }: AssignmentsContainerProps) {
  const t = useTranslations('assignments')
  const tCommon = useTranslations('common')
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleAssignmentCreated() {
    setRefreshTrigger((prev) => prev + 1)
  }

  function handleEditAssignment(assignmentId: string) {
    setEditingAssignmentId(assignmentId)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleEditComplete() {
    setEditingAssignmentId(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  function handleCancelEdit() {
    setEditingAssignmentId(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form Column */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {editingAssignmentId ? t('editAssignment') : t('createAssignment')}
            </h2>
            {editingAssignmentId && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {tCommon('cancel')} {t('edit')}
              </button>
            )}
          </div>
          <AssignmentForm
            tutorId={tutorId}
            assignmentId={editingAssignmentId}
            onAssignmentCreated={handleAssignmentCreated}
            onEditComplete={handleEditComplete}
          />
        </div>
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('yourAssignments')}
          </h2>
          <AssignmentList
            key={refreshTrigger}
            tutorId={tutorId}
            onEditAssignment={handleEditAssignment}
          />
        </div>
      </div>
    </div>
  )
}
