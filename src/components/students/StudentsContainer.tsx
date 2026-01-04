"use client"

import { useState } from "react"
import { AddStudentForm } from "./AddStudentForm"
import { StudentList } from "./StudentList"
import { useTranslations } from "next-intl"

interface StudentsContainerProps {
  tutorId: string
  locale: string
}

export function StudentsContainer({ tutorId, locale }: StudentsContainerProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const t = useTranslations('students')

  function handleStudentAdded() {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Add Student Form Column */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('addStudent')}
          </h2>
          <AddStudentForm tutorId={tutorId} onStudentAdded={handleStudentAdded} />
        </div>
      </div>

      {/* Student List Column */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t('myStudents')}
          </h2>
          <StudentList key={refreshTrigger} tutorId={tutorId} />
        </div>
      </div>
    </div>
  )
}
