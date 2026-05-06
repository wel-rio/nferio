import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando atualização de esquema via SQL bruto...');
  try {
    // 1. Adicionar colunas na tabela Company
    console.log('Atualizando tabela Company...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Company" 
      ADD COLUMN IF NOT EXISTS "nfeSerie" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "nfeNextNumber" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "nfceSerie" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "nfceNextNumber" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "cscId" TEXT,
      ADD COLUMN IF NOT EXISTS "cscKey" TEXT;
    `);

    // 2. Adicionar coluna na tabela User
    console.log('Atualizando tabela User...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "permissions" TEXT DEFAULT 'all';
    `);

    console.log('✅ Esquema atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar esquema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
