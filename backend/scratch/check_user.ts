import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'contato.rtcdecor@gmail.com';
  console.log(`🔍 Buscando usuário: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  });

  if (!user) {
    console.log('❌ Usuário NÃO encontrado no banco de dados!');
    return;
  }

  console.log('✅ Usuário encontrado!');
  console.log('ID:', user.id);
  console.log('Role:', user.role);
  console.log('Empresa:', user.company?.razaoSocial || 'SEM EMPRESA');
  console.log('Status da Assinatura:', user.company?.subscriptionStatus);
  console.log('Vencimento:', user.company?.trialEndsAt);
  
  if (!user.companyId) {
    console.log('⚠️ ALERTA: Usuário não está vinculado a nenhuma empresa!');
  }
}

main()
  .catch(e => console.error('❌ Erro no diagnóstico:', e))
  .finally(() => prisma.$disconnect());
