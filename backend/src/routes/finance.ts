import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Listar contas a pagar
 */
router.get('/payables', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  try {
    const payables = await prisma.accountPayable.findMany({
      where: { companyId: String(companyId || 'default-company-id') },
      orderBy: { dueDate: 'asc' }
    });
    res.json(payables);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
});

/**
 * Listar contas a receber
 */
router.get('/receivables', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  try {
    const receivables = await prisma.accountReceivable.findMany({
      where: { companyId: String(companyId || 'default-company-id') },
      orderBy: { dueDate: 'asc' }
    });
    res.json(receivables);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contas a receber' });
  }
});

/**
 * Resumo financeiro (Totalizadores)
 */
router.get('/summary', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  try {
    const payables = await prisma.accountPayable.findMany({
      where: { companyId: String(companyId || 'default-company-id'), status: 'PENDING' }
    });
    const receivables = await prisma.accountReceivable.findMany({
      where: { companyId: String(companyId || 'default-company-id'), status: 'PENDING' }
    });

    const totalPayable = payables.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalReceivable = receivables.reduce((acc, curr) => acc + Number(curr.amount), 0);

    res.json({
      totalPayable,
      totalReceivable,
      balance: totalReceivable - totalPayable
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
  }
});

export default router;
