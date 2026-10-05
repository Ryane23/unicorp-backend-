import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPersistence() {
  let probeFacultyId: string | undefined;

  try {
    console.log('Testing UniCore PostgreSQL connectivity and persistence...');
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('PASS: PostgreSQL connection accepted a query.');

    const probeCode = `DB${Date.now().toString().slice(-10)}`;
    const created = await prisma.faculties.create({
      data: {
        code: probeCode,
        name: `Database persistence probe ${probeCode}`,
        description: 'Temporary record created by npm run test:db',
      },
    });
    probeFacultyId = created.id;

    const persisted = await prisma.faculties.findUnique({ where: { id: created.id } });
    if (!persisted || persisted.code !== probeCode) {
      throw new Error('The inserted faculty could not be read back from PostgreSQL.');
    }

    console.log('PASS: A record was inserted and read back from PostgreSQL.');
    console.table([{
      id: persisted.id,
      table: 'faculties',
      code: persisted.code,
      name: persisted.name,
      createdAt: persisted.createdAt.toISOString(),
    }]);

    const admin = await prisma.users.findUnique({
      where: { email: 'admin@unicore.edu' },
      select: {
        id: true,
        email: true,
        status: true,
        roles: { select: { role: { select: { slug: true } } } },
      },
    });
    if (!admin || !admin.roles.some(({ role }) => role.slug === 'ADMIN')) {
      throw new Error('Seeded Admin account was not found. Run npm run prisma:seed first.');
    }

    const [students, lecturers, faculties, departments, programs, courses] = await Promise.all([
      prisma.students.count({ where: { deletedAt: null } }),
      prisma.lecturers.count({ where: { deletedAt: null } }),
      prisma.faculties.count({ where: { deletedAt: null } }),
      prisma.departments.count({ where: { deletedAt: null } }),
      prisma.programs.count({ where: { deletedAt: null } }),
      prisma.courses.count({ where: { deletedAt: null, isActive: true } }),
    ]);

    console.log('PASS: Seeded Admin login and dashboard source data exist.');
    console.table([{ email: admin.email, status: admin.status, students, lecturers, faculties, departments, programs, courses }]);
    console.log('Database persistence verification completed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } finally {
    if (probeFacultyId) {
      await prisma.faculties.deleteMany({ where: { id: probeFacultyId } });
      console.log('Cleanup: temporary persistence probe removed.');
    }
    await prisma.$disconnect();
  }
}

verifyPersistence();
