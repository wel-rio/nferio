import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Relatório de Vendas
 */
router.get('/sales', async (req: Request, res: Response) => {
  const { companyId, startDate, endDate, status, customerId } = req.query;

  if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

  try {
    const where: any = {
      companyId: String(companyId),
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate) + 'T23:59:59.999Z'),
      };
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (customerId) {
      where.customerId = String(customerId);
    }

    const sales = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalAmount = sales.reduce((acc, sale) => acc + sale.netAmount, 0);

    res.json({
      summary: {
        count: sales.length,
        totalAmount
      },
      data: sales
    });
  } catch (error) {
    console.error('Report Sales Error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de vendas' });
  }
});

/**
 * Relatório de Movimentação de Estoque (Kardex)
 */
router.get('/stock', async (req: Request, res: Response) => {
  const { companyId, startDate, endDate, productId, type } = req.query;

  if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

  try {
    const where: any = {
      companyId: String(companyId),
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate) + 'T23:59:59.999Z'),
      };
    }

    if (productId) {
      where.productId = String(productId);
    }

    if (type && type !== 'ALL') {
      where.type = String(type);
    }

    const movements = await prisma.stockTransaction.findMany({
      where,
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      summary: {
        count: movements.length,
        in: movements.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.quantity, 0),
        out: movements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.quantity, 0)
      },
      data: movements
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório de estoque' });
  }
});

export default router;
