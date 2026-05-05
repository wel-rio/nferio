import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get summary for the dashboard
router.get('/summary', async (req, res) => {
  try {
    const receivables = await prisma.accountReceivable.findMany({
      where: { status: 'PENDENTE' }
    });
    
    const cashFlow = await prisma.cashFlow.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { name: true } } }
    });

    const totalReceivable = receivables.reduce((acc, r) => acc + r.amount, 0);

    res.json({
      totalReceivable,
      recentMoves: cashFlow
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
  }
});

// List accounts receivable
router.get('/receivables', async (req, res) => {
  try {
    const data = await prisma.accountReceivable.findMany({
      orderBy: { dueDate: 'asc' },
      include: { order: true }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a receber' });
  }
});

export default router;
