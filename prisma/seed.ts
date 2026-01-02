import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('📦 Clearing existing subjects and categories...')
  await prisma.category.deleteMany()
  await prisma.subject.deleteMany()

  // Create Mathematics subject with 13 categories
  console.log('➕ Creating Mathematics subject...')
  const mathematics = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      categories: {
        create: [
          {
            name: 'Liczby rzeczywiste',
            slug: 'liczby-rzeczywiste',
            order: 1,
          },
          {
            name: 'Wyrażenia algebraiczne',
            slug: 'wyrazenia-algebraiczne',
            order: 2,
          },
          {
            name: 'Równania i nierówności',
            slug: 'rownania-i-nierownosci',
            order: 3,
          },
          {
            name: 'Układy równań',
            slug: 'uklady-rownan',
            order: 4,
          },
          {
            name: 'Funkcje',
            slug: 'funkcje',
            order: 5,
          },
          {
            name: 'Ciągi',
            slug: 'ciagi',
            order: 6,
          },
          {
            name: 'Trygonometria',
            slug: 'trygonometria',
            order: 7,
          },
          {
            name: 'Planimetria',
            slug: 'planimetria',
            order: 8,
          },
          {
            name: 'Geometria analityczna na płaszczyźnie kartezjańskiej',
            slug: 'geometria-analityczna',
            order: 9,
          },
          {
            name: 'Stereometria',
            slug: 'stereometria',
            order: 10,
          },
          {
            name: 'Kombinatoryka',
            slug: 'kombinatoryka',
            order: 11,
          },
          {
            name: 'Rachunek prawdopodobieństwa i statystyka',
            slug: 'prawdopodobienstwo-statystyka',
            order: 12,
          },
          {
            name: 'Optymalizacja i rachunek różniczkowy',
            slug: 'optymalizacja-rozniczkowy',
            order: 13,
          },
        ],
      },
    },
    include: {
      categories: true,
    },
  })

  console.log(`✅ Created Mathematics with ${mathematics.categories.length} categories`)

  // Create Polish (Język Polski) subject with categories
  console.log('📚 Creating Polish Language subject...')
  const polish = await prisma.subject.create({
    data: {
      name: 'Język Polski',
      slug: 'jezyk-polski',
      categories: {
        create: [
          {
            name: 'Gramatyka',
            slug: 'gramatyka',
            order: 1,
          },
          {
            name: 'Ortografia',
            slug: 'ortografia',
            order: 2,
          },
          {
            name: 'Interpunkcja',
            slug: 'interpunkcja',
            order: 3,
          },
          {
            name: 'Lektury',
            slug: 'lektury',
            order: 4,
          },
          {
            name: 'Analiza tekstu',
            slug: 'analiza-tekstu',
            order: 5,
          },
          {
            name: 'Pisanie wypracowań',
            slug: 'pisanie-wypracowan',
            order: 6,
          },
          {
            name: 'Słownictwo',
            slug: 'slownictwo',
            order: 7,
          },
        ],
      },
    },
    include: {
      categories: true,
    },
  })

  console.log(`✅ Created Polish with ${polish.categories.length} categories`)

  // Create English (Język Angielski) subject with categories
  console.log('🇬🇧 Creating English Language subject...')
  const english = await prisma.subject.create({
    data: {
      name: 'Język Angielski',
      slug: 'jezyk-angielski',
      categories: {
        create: [
          {
            name: 'Grammar',
            slug: 'grammar',
            order: 1,
          },
          {
            name: 'Vocabulary',
            slug: 'vocabulary',
            order: 2,
          },
          {
            name: 'Reading Comprehension',
            slug: 'reading-comprehension',
            order: 3,
          },
          {
            name: 'Writing',
            slug: 'writing',
            order: 4,
          },
          {
            name: 'Speaking',
            slug: 'speaking',
            order: 5,
          },
          {
            name: 'Listening',
            slug: 'listening',
            order: 6,
          },
          {
            name: 'Tenses',
            slug: 'tenses',
            order: 7,
          },
          {
            name: 'Phrasal Verbs',
            slug: 'phrasal-verbs',
            order: 8,
          },
        ],
      },
    },
    include: {
      categories: true,
    },
  })

  console.log(`✅ Created English with ${english.categories.length} categories`)

  // Summary
  const totalSubjects = await prisma.subject.count()
  const totalCategories = await prisma.category.count()

  console.log('\n🎉 Database seeding completed!')
  console.log(`📊 Summary:`)
  console.log(`   - ${totalSubjects} subjects created`)
  console.log(`   - ${totalCategories} categories created`)
  console.log('\n📋 Subjects:')
  console.log(`   - Mathematics: 13 categories`)
  console.log(`   - Język Polski: 7 categories`)
  console.log(`   - Język Angielski: 8 categories`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
