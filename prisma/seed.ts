import { PrismaClient, ExpenseCategory, ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (optional)
  await prisma.expense.deleteMany();
  await prisma.service.deleteMany();

  // Sample expenses for testing
  const sampleExpenses = [
    {
      category: ExpenseCategory.FUEL,
      amount: 150.5,
    },
    {
      category: ExpenseCategory.MAINTENANCE,
      amount: 280.0,
    },
    {
      category: ExpenseCategory.INSURANCE,
      amount: 450.0,
    },
    {
      category: ExpenseCategory.CAR_WASH,
      amount: 45.5,
    },
    {
      category: ExpenseCategory.PARKING,
      amount: 25.0,
    },
  ];

  for (const expense of sampleExpenses) {
    const created = await prisma.expense.create({
      data: expense,
    });
    console.log(`✓ Created expense: ${created.category} - R$ ${created.amount}`);
  }

  // Sample services for testing
  const sampleServices = [
    {
      serviceType: 'Troca de óleo',
      date: new Date('2026-03-12'),
      notes: 'Óleo sintético 5W-30',
      status: ServiceStatus.COMPLETED,
    },
    {
      serviceType: 'Rodízio de pneus',
      date: new Date('2026-04-06'),
      notes: 'Verificar pressão e desgaste',
      status: ServiceStatus.UPCOMING,
    },
    {
      serviceType: 'Inspeção dos freios',
      date: new Date('2026-05-20'),
      notes: 'Verificação completa do sistema de frenagem',
      status: ServiceStatus.SCHEDULED,
    },
    {
      serviceType: 'Troca do filtro de ar',
      date: new Date('2026-06-15'),
      notes: 'Filtro original',
      status: ServiceStatus.SCHEDULED,
    },
    {
      serviceType: 'Limpeza do ar condicionado',
      date: new Date('2026-04-10'),
      notes: null,
      status: ServiceStatus.SCHEDULED,
    },
  ];

  for (const service of sampleServices) {
    const created = await prisma.service.create({
      data: service,
    });
    console.log(`✓ Created service: ${created.serviceType} (${created.status}) - ${created.date.toDateString()}`);
  }

  console.log('✓ Database seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
