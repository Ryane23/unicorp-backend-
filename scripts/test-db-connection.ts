import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connectivity...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Number of users in database: ${userCount}`);
    
    const tables = ['User', 'Role', 'Permission', 'Faculty', 'Department', 'Program', 'Course'];
    console.log('\nChecking schema models...');
    for (const table of tables) {
      try {
        // @ts-ignore
        await prisma[table.toLowerCase()].findFirst();
        console.log(`✅ Model ${table} is accessible`);
      } catch (err) {
        console.log(`❌ Model ${table} error: ${err.message}`);
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
