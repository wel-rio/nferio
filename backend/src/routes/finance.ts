import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Listar contas a pagar
router.get('/payables', async (req, res) => {
  const { companyId } = req.query;
  try {
    const payables = await prisma.accountPayable.findMany({
      where: { companyId: String(companyId) },
      orderBy: { dueDate: 'asc' }
    });
    res.json(payables);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
});

export default router;
