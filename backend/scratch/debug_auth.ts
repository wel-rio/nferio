import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  const pass = '@Master2026';
  
  const result = await prisma.$queryRawUnsafe(`
    SELECT 
      id, 
      email, 
      password,
      crypt('${pass}', password) = password as is_valid 
    FROM "User" 
    WHERE email = '${email}'
  `);
  
  console.log('DIAGNÓSTICO:', JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
