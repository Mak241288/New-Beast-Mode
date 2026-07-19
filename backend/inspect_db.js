const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in database:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
