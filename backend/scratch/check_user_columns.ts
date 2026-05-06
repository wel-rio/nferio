import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User';
    `;
    console.log('Colunas da tabela User:', JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error('Erro ao listar colunas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
