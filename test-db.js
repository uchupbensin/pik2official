const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tokyo = await prisma.projects.findUnique({ where: { slug: 'tokyo' } });
  console.log(tokyo);
}
main().catch(console.error).finally(() => prisma.$disconnect());
