import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  const pass = '@Master2026';
  
  await prisma.$executeRawUnsafe(`
    UPDATE "User" 
    SET password = crypt('${pass}', gen_salt('bf')) 
    WHERE email = '${email}'
  `);
  
  console.log('✅ SENHA RESETADA E SINCRONIZADA COM O SUPABASE!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
