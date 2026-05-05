import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all products (Mocking companyId for now until auth is fully implemented)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { 
      name, sku, barcode, price, costPrice, stock, unit, 
      ncm, cest, cfopPadrao, origem, categoryId, companyId 
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name, sku, barcode, price: Number(price), costPrice: Number(costPrice), 
        stock: Number(stock), unit, ncm, cest, cfopPadrao, origem,
        categoryId,
        // Mock company for now if not provided
        company: {
          connectOrCreate: {
            where: { id: companyId || 'default-company-id' },
            create: {
              id: companyId || 'default-company-id',
              cnpj: '00000000000000',
              razaoSocial: 'Empresa Padrão',
            }
          }
        }
      }
    });

    // If initial stock is provided, create a stock transaction
    if (Number(stock) > 0) {
      await prisma.stockTransaction.create({
        data: {
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

// Add stock movement
router.post('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;

    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ error: 'Quantidade inválida' });

    // Update product stock
    const product = await prisma.product.update({
      where: { id },
      data: {
        stock: {
          [type === 'IN' ? 'increment' : 'decrement']: qty
        }
      }
    });

    // Register transaction
    const transaction = await prisma.stockTransaction.create({
      data: {
        productId: id,
        type,
        quantity: qty,
        reason
      }
    });

    res.status(201).json({ product, transaction });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao movimentar estoque' });
  }
});

// Get stock movements
router.get('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await prisma.stockTransaction.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
});

export default router;
