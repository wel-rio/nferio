import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Listar todas as empresas do sistema
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, products: true, orders: true }
        }
      }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Estatísticas globais do negócio
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalCompanies = await prisma.company.count();
    const activeCompanies = await prisma.company.count({ where: { subscriptionStatus: 'ACTIVE' } });
    const trialCompanies = await prisma.company.count({ where: { subscriptionStatus: 'TRIAL' } });
    
    // Soma do faturamento fictício baseado nos planos (isso será real após integração total)
    const stats = {
      totalCompanies,
      activeCompanies,
      trialCompanies,
      monthlyRevenue: (activeCompanies * 119.90) // Média simulada
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
