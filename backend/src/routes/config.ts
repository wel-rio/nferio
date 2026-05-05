import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get company config
router.get('/', async (req, res) => {
  try {
    const company = await prisma.company.findFirst();
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Update company config
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const company = await prisma.company.findFirst();
    
    if (company) {
      const updated = await prisma.company.update({
        where: { id: company.id },
        data
      });
      res.json(updated);
    } else {
      const created = await prisma.company.create({ data });
      res.json(created);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

export default router;
