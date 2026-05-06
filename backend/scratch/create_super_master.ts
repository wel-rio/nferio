import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@nferio.com.br';
  const password = '@MasterNferio2026';
  const hashedPassword = await bcrypt.hash(password, 10);
  const companyId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'; // Usando a mesma empresa da RTC para facilitar ou criar uma nova se preferir

  try {
    // 1. Inserir o Usuário Master via SQL bruto (por causa das discrepâncias de schema que resolvemos)
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (
        "id", "email", "password", "name", "role", "permissions", "companyId", "updatedAt"
      ) VALUES (
        gen_random_uuid(), '${email}', '${hashedPassword}', 'NFERIO MASTER', 'MASTER', 'master,all', '${companyId}', NOW()
      ) ON CONFLICT (email) DO UPDATE SET "role" = 'MASTER', "permissions" = 'master,all';
    `);

    console.log('✅ Usuário Master Admin criado/atualizado com sucesso!');
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('Rota de Acesso: /master');
  } catch (error) {
    console.error('❌ Erro ao criar Master Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
