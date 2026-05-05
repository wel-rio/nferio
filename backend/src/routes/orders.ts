import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Create an order or quote
router.post('/', async (req, res) => {
  try {
    const { 
      status, customerName, customerDoc, discount, items, companyId
    } = req.body;

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: `Produto ${item.productId} não encontrado` });

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    const netAmount = totalAmount - (discount || 0);

    const order = await prisma.order.create({
      data: {
        status: status || 'ORCAMENTO',
        customerName,
        customerDoc,
        totalAmount,
        discount: discount || 0,
        netAmount,
        company: {
          connectOrCreate: {
            where: { id: companyId || 'default-company-id' },
            create: {
              id: companyId || 'default-company-id',
              cnpj: '00000000000000',
              razaoSocial: 'Empresa Padrão',
            }
          }
        },
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });

    // If it's a PEDIDO or FATURADO, we need to subtract stock
    if (order.status === 'PEDIDO' || order.status === 'FATURADO') {
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        
        await prisma.stockTransaction.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Venda - Pedido #${order.orderNumber}`
          }
        });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Convert Quote to Order
router.post('/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (order.status !== 'ORCAMENTO') return res.status(400).json({ error: 'Apenas orçamentos podem ser convertidos' });

    // Update status and subtract stock
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'PEDIDO' }
    });

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
      
      await prisma.stockTransaction.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Conversão de Orçamento - Pedido #${order.orderNumber}`
        }
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao converter pedido' });
  }
});

export default router;
