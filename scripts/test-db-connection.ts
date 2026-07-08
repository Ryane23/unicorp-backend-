import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connectivity (Pluralized Schema)...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const userCount = await prisma.users.count();
    console.log(`📊 Number of users in database: ${userCount}`);
    
    // Updated table names to match pluralized schema
    const models = ['users', 'roles', 'permissions', 'faculties', 'departments', 'programs', 'courses'];
    console.log('\nChecking schema model accessibility...');
    for (const model of models) {
      try {
        // @ts-ignore
        await prisma[model].findFirst();
        console.log(`✅ Property prisma.${model} is accessible`);
      } catch (err) {
        console.log(`❌ Property prisma.${model} error: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
