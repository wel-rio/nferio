import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  const password = '@Master2026';
  const hashedPassword = await bcrypt.hash(password, 10);
  const companyId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
  const userId = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e';

  try {
    // 1. Inserir Empresa via SQL bruto
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Company" (
        "id", "cnpj", "razaoSocial", "nomeFantasia", "subscriptionStatus", "plan", "trialEndsAt", "updatedAt"
      ) VALUES (
        '${companyId}', '00.000.000/0001-91', 'RTC DECOR TECNOLOGIA', 'RTC DECOR', 'ACTIVE', 'UNLIMITED', NOW() + interval '365 days', NOW()
      ) ON CONFLICT (id) DO NOTHING
    `);

    // 2. Inserir Usuário via SQL bruto
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (
        "id", "email", "password", "name", "role", "companyId", "updatedAt"
      ) VALUES (
        '${userId}', '${email}', '${hashedPassword}', 'RTC Decor Master', 'OWNER', '${companyId}', NOW()
      )
    `);

    console.log('Usuário Master criado com sucesso via SQL!');
    console.log('Email:', email);
    console.log('Senha: @Master2026');
    console.log('Plano: UNLIMITED (PAGO)');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
