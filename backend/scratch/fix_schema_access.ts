import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏗️ Restaurando acesso ao esquema PUBLIC...');

  // Conceder USAGE no esquema para que o Supabase consiga "entrar" na pasta
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO anon;');
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO authenticated;');
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO service_role;');
  
  // Garantir que a função possa ser vista
  await prisma.$executeRawUnsafe('GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;');
  await prisma.$executeRawUnsafe('GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;');
  await prisma.$executeRawUnsafe('GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;');

  console.log('✅ PORTAS ABERTAS! O esquema PUBLIC agora está acessível.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
