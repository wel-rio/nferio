import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Listar produtos da empresa
 */
router.get('/', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  try {
    const products = await prisma.product.findMany({
      where: { companyId: String(companyId) },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

/**
 * Criar novo produto
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      name, sku, barcode, price, costPrice, stock, unit, 
      ncm, cest, cfopPadrao, origem, categoryId, companyId 
    } = req.body;

    if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

    const product = await prisma.product.create({
      data: {
        name, 
        sku, 
        barcode, 
        price: Number(price), 
        costPrice: Number(costPrice || 0), 
        stock: Number(stock || 0), 
        unit: unit || 'UN', 
        ncm, 
        cest, 
        cfopPadrao, 
        origem: origem || '0',
        categoryId,
        companyId: String(companyId)
      }
    });

    // Se houver estoque inicial, registra transação
    if (Number(stock) > 0) {
      await prisma.stockTransaction.create({
        data: {
          companyId: String(companyId),
          productId: product.id,
          type: 'IN',
          quantity: Number(stock),
          reason: 'Estoque Inicial (Cadastro)'
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

/**
 * Movimentar estoque (Entrada/Saída rápida)
 */
router.post('/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, companyId } = req.body;

    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ error: 'Quantidade inválida' });

    // Atualiza saldo
    const product = await prisma.product.update({
      where: { id },
      data: {
        stock: {
          [type === 'ADD' || type === 'IN' ? 'increment' : 'decrement']: qty
        }
      }
    });

    // Registra transação
    const transaction = await prisma.stockTransaction.create({
      data: {
        companyId: String(companyId || product.companyId),
        productId: id,
        type: (type === 'ADD' || type === 'IN') ? 'IN' : 'OUT',
        quantity: qty,
        reason
      }
    });

    res.status(201).json({ product, transaction });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao movimentar estoque' });
  }
});

export default router;
