import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Ajuste de Estoque Avulso
router.post('/adjust', async (req, res) => {
  const { productId, quantity, type, reason, companyId } = req.body;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    // Calcula novo estoque
    const newStock = type === 'IN' 
      ? product.stock + Number(quantity) 
      : type === 'OUT' 
        ? product.stock - Number(quantity)
        : Number(quantity); // Caso seja ajuste de balanço (SET)

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });

    // Registra a transação
    await prisma.stockTransaction.create({
      data: {
        companyId,
        productId,
        type,
        quantity: Number(quantity),
        reason
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

// Histórico de Movimentação por Produto
router.get('/history/:productId', async (req, res) => {
  const { productId } = req.params;
  const { companyId } = req.query;

  try {
    const moves = await prisma.stockTransaction.findMany({
      where: { 
        productId,
        companyId: String(companyId)
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(moves);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

export default router;
