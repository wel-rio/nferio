import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Listar clientes da empresa
router.get('/', async (req, res) => {
  const { companyId } = req.query;
  try {
    const customers = await prisma.customer.findMany({
      where: { companyId: String(companyId) },
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  const { companyId, name, document, email, phone, type, ie, address, city, uf } = req.body;
  try {
    const customer = await prisma.customer.create({
      data: {
        companyId,
        name,
        document,
        email,
        phone,
        type,
        ie,
        address,
        city,
        uf
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, document, email, phone, type, ie, address, city, uf } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        document,
        email,
        phone,
        type,
        ie,
        address,
        city,
        uf
      }
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

export default router;
