import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  const password = '@Master2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`🔐 Atualizando senha para: ${email}...`);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log('✅ Senha atualizada com sucesso para @Master2026');
}

main()
  .catch(e => console.error('❌ Erro:', e))
  .finally(() => prisma.$disconnect());
