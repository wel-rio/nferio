import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛠️ Configurando funções de segurança no banco de dados...');

  // 1. Ativar pgcrypto
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  // 2. Criar função de validação de senha (RPC)
  // Esta função compara a senha digitada com o hash bcrypt salvo
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_user_password(p_email TEXT, p_password TEXT)
    RETURNS TABLE (
      id UUID,
      email TEXT,
      name TEXT,
      role TEXT,
      permissions TEXT,
      "companyId" UUID,
      company_data JSONB
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.permissions, 
        u."companyId",
        to_jsonb(c.*) as company_data
      FROM "User" u
      JOIN "Company" c ON u."companyId" = c.id
      WHERE u.email = p_email 
      AND crypt(p_password, u.password) = u.password;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log('✅ Função check_user_password criada com sucesso no Supabase!');
}

main()
  .catch(e => console.error('❌ Erro:', e))
  .finally(() => prisma.$disconnect());
