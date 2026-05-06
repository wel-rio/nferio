import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  const password = '@Master2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar a empresa com status ACTIVE (Pago)
      const company = await tx.company.create({
        data: {
          cnpj: '00.000.000/0001-91', // CNPJ de teste
          razaoSocial: 'RTC DECOR TECNOLOGIA',
          nomeFantasia: 'RTC DECOR',
          subscriptionStatus: 'ACTIVE', // Status Pago
          plan: 'UNLIMITED', // Plano Ilimitado
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano de validade para teste
        }
      });

      // 2. Criar o usuário administrador
      const user = await tx.user.create({
        data: {
          name: 'RTC Decor Master',
          email: email,
          password: hashedPassword,
          role: 'OWNER',
          permissions: 'all',
          companyId: company.id
        }
      });

      return { user, company };
    });

    console.log('Usuário Master criado com sucesso!');
    console.log('Email:', result.user.email);
    console.log('Empresa:', result.company.razaoSocial);
    console.log('Status:', result.company.subscriptionStatus);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
