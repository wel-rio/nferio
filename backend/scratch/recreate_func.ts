import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Re-migrando função check_user_password com tipos compatíveis...');

  // 1. Removemos a antiga
  await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS check_user_password(TEXT, TEXT)');

  // 2. Criamos a nova usando TEXT para os IDs (para evitar erro de conversão)
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_user_password(p_email TEXT, p_password TEXT)
    RETURNS TABLE (
      id TEXT,
      email TEXT,
      name TEXT,
      role TEXT,
      permissions TEXT,
      "companyId" TEXT,
      company_data JSONB
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        u.id::TEXT, 
        u.email::TEXT, 
        u.name::TEXT, 
        u.role::TEXT, 
        u.permissions::TEXT, 
        u."companyId"::TEXT,
        to_jsonb(c.*) as company_data
      FROM "User" u
      JOIN "Company" c ON u."companyId" = c.id
      WHERE u.email = p_email 
      AND crypt(p_password, u.password) = u.password;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // 3. Liberamos as permissões novamente (já que a função é nova)
  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO anon;');
  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO authenticated;');
  await prisma.$executeRawUnsafe('GRANT EXECUTE ON FUNCTION check_user_password(TEXT, TEXT) TO service_role;');

  console.log('✅ FUNÇÃO ATUALIZADA COM SUCESSO!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
