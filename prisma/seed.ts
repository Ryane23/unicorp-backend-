import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('Seeding UniCore ERP...');

  const existing = await prisma.tenants.findUnique({ where: { slug: 'demo-university' } });
  if (existing) {
    console.log('Seed data already exists, skipping.');
    return;
  }

  const tenant = await prisma.tenants.create({
    data: {
      id: DEMO_TENANT_ID,
      tenantId: DEMO_TENANT_ID,
      name: 'Demo University',
      slug: 'demo-university',
      status: 'ACTIVE',
      plan: 'enterprise',
      maxUsers: 5000,
      maxStudents: 50000,
    },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const adminRole = await prisma.roles.create({
    data: {
      tenantId: tenant.id,
      name: 'Super Admin',
      slug: 'super-admin',
      isSystem: true,
      level: 0,
    },
  });

  const permData = [
    { name: 'All Access', slug: '*', module: 'system', action: 'all' },
    { name: 'Read Users', slug: 'users:read', module: 'users', action: 'read' },
    { name: 'Manage Students', slug: 'students:manage', module: 'students', action: 'manage' },
  ];

  for (const perm of permData) {
    const permission = await prisma.permissions.create({
      data: { tenantId: tenant.id, ...perm, isSystem: true },
    });
    await prisma.rolePermissions.create({
      data: { tenantId: tenant.id, roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const admin = await prisma.users.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@demo.university.edu',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  await prisma.userRoles.create({
    data: { tenantId: tenant.id, userId: admin.id, roleId: adminRole.id },
  });

  console.log(`Seeded tenant: ${tenant.slug} (${tenant.id})`);
  console.log('Admin: admin@demo.university.edu / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
