import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const results = [
  { type: '混凝土', title: '混凝土抗压强度试验 C30', unique_no: 'HNT-2026-001', date: new Date('2026-05-20') },
  { type: '钢筋', title: '钢筋拉伸试验 HRB400', unique_no: 'GJ-2026-012', date: new Date('2026-05-18') },
  { type: '水泥', title: '水泥凝结时间检测', unique_no: 'SN-2026-005', date: new Date('2026-05-22') },
  { type: '砂石', title: '砂石含泥量检测', unique_no: 'SS-2026-003', date: new Date('2026-05-15') },
  { type: '混凝土', title: '混凝土回弹强度检测 C25', unique_no: 'HNT-2026-002', date: new Date('2026-05-25') },
]

async function main() {
  console.log('Seeding database...')

  for (const data of results) {
    const r = await prisma.result.create({ data: { ...data, status: 'draft' } })
    console.log(`  Created result: ${r.title} (${r.id})`)
  }

  console.log(`Seeded ${results.length} results.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
