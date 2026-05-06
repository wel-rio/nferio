import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔓 Liberando permissões de execução...');

  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO anon;');
  console.log('1. Anon liberado');
  
  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO authenticated;');
  console.log('2. Authenticated liberado');
  
  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO service_role;');
  console.log('3. Service Role liberado');

  console.log('✅ TUDO LIBERADO!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
