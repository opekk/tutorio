"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface Student {
  id: string
  name: string
  email: string
  profileId: string
  createdAt: string
}

interface StudentListProps {
  tutorId: string
}

export function StudentList({ tutorId }: StudentListProps) {
  const router = useRouter()
  const t = useTranslations('students')
  const tCommon = useTranslations('common')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [tutorId])

  async function fetchStudents() {
    try {
      const response = await fetch(`/api/tutors/${tutorId}/students`)
      if (!response.ok) {
        throw new Error(t('failedToLoad'))
      }
      const data = await response.json()
      setStudents(data.students)
    } catch (error) {
      setError(t('failedToLoad'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function removeStudent(studentId: string) {
    if (!confirm(t('confirmRemove'))) {
      return
    }

    setRemovingStudentId(studentId)
    try {
      const response = await fetch(`/api/tutors/${tutorId}/students/${studentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t('failedToRemove'))
      }

      setStudents(students.filter((s) => s.id !== studentId))
      router.refresh()
    } catch (error) {
      alert(t('failedToRemove'))
      console.error(error)
    } finally {
      setRemovingStudentId(null)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">{t('loadingStudents')}</p>
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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      {/* Student Count */}
      <div className="text-sm text-text-secondary">
        {filteredStudents.length === 1
          ? t('studentsCountSingular', { count: filteredStudents.length })
          : t('studentsCountPlural', { count: filteredStudents.length })}
        {searchQuery && ` ${t('matchingQuery', { query: searchQuery })}`}
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">
            {searchQuery
              ? t('noMatchesFound')
              : t('addStudentPrompt')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:bg-surface-secondary transition-colors"
            >
              <div>
                <h3 className="font-medium text-text-primary">
                  {student.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {student.email}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {t('addedOn', { date: new Date(student.createdAt).toLocaleDateString() })}
                </p>
              </div>
              <button
                onClick={() => removeStudent(student.id)}
                disabled={removingStudentId === student.id}
                className="rounded-md px-3 py-1 text-sm font-medium text-error hover:bg-error-bg disabled:opacity-50 transition-colors"
              >
                {removingStudentId === student.id ? t('removing') : t('removeStudent')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
