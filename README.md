# Tutorio

A web-based tutoring platform that helps tutors manage students and assignments with LaTeX-enabled questions.

## Features

- **Role-Based Authentication**: Separate registration for students and tutors
- **Student Management**: Tutors add and manage students by email
- **Question Creation**: Create LaTeX-enabled questions organized by subject and category
- **Multi-Subject Support**: Mathematics (13 categories), Polish (7 categories), English (8 categories)
- **Assignment System**: Assign question sets to students (coming soon)
- **Progress Tracking**: Monitor student performance and review errors (coming soon)

## Tech Stack

- Next.js 16.1.1 with TypeScript
- NextAuth.js v5 for authentication
- PostgreSQL with Prisma ORM
- Tailwind CSS 4
- react-katex for LaTeX math rendering

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (`.env`):
```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. Initialize database:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
npx prisma studio    # Open database GUI
npm run seed         # Seed subjects and categories
```
