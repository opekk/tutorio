import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                Tutorio
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            <span className="block">Tutoring Made</span>
            <span className="block text-primary">
              Simple & Effective
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl">
            Create assignments, track progress, and help your students succeed.
            All your tutoring tools in one beautiful platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary-hover transition-colors shadow-md"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-border bg-surface px-8 py-4 text-base font-semibold text-primary hover:bg-surface-secondary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-bg text-info mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Question Bank
            </h3>
            <p className="text-text-secondary">
              Create and organize questions with LaTeX support for mathematics, Polish, and English.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-bg text-info mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Smart Assignments
            </h3>
            <p className="text-text-secondary">
              Build custom assignments from your question bank with drag-and-drop ordering.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-bg text-success mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Progress Tracking
            </h3>
            <p className="text-text-secondary">
              Monitor student performance and identify areas that need attention.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-bg text-warning mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Student Management
            </h3>
            <p className="text-text-secondary">
              Easily manage your students and send them personalized assignments.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-bg text-info mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              LaTeX Support
            </h3>
            <p className="text-text-secondary">
              Write beautiful mathematical formulas with full LaTeX rendering support.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-bg text-success mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Instant Feedback
            </h3>
            <p className="text-text-secondary">
              Students get immediate results on their answers and can learn from mistakes.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="rounded-3xl border border-border bg-surface-tertiary p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Ready to transform your tutoring?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Join Tutorio today and make teaching easier and more effective.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Get Started Free
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-text-secondary">
            © 2026 Tutorio. Making tutoring better, one assignment at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
