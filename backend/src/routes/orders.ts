import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Listar pedidos da empresa
 */
router.get('/', async (req: Request, res: Response) => {
  const { companyId } = req.query;
  try {
    const orders = await prisma.order.findMany({
      where: { companyId: String(companyId) },
      include: {
        items: {
          include: { product: true }
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

/**
 * Criar um novo pedido ou orçamento
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      status, customerName, customerDoc, customerId, discount, items, companyId
    } = req.body;

    if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

    // Calcula totais
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
        customerId,
        totalAmount,
        discount: discount || 0,
        netAmount,
        companyId: String(companyId),
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });

    // Se já for PEDIDO ou FATURADO, baixa estoque e gera financeiro
    if (order.status === 'PEDIDO' || order.status === 'FATURADO') {
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        
        await prisma.stockTransaction.create({
          data: {
            companyId: String(companyId),
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Venda - Pedido #${order.orderNumber}`
          }
        });
      }

      // Criar Conta a Receber
      await prisma.accountReceivable.create({
        data: {
          companyId: String(companyId),
          orderId: order.id,
          description: `Venda - Pedido #${order.orderNumber}`,
          amount: netAmount,
          status: 'PENDENTE', // Pode ser alterado para PAGO se houver integração com caixa
          dueDate: new Date()
        }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

/**
 * Converter Orçamento em Pedido (Efetivar Venda)
 */
router.post('/:id/convert', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (order.status !== 'ORCAMENTO') return res.status(400).json({ error: 'Apenas orçamentos podem ser convertidos' });

    // Atualiza status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'PEDIDO' }
    });

    // Baixa estoque e gera financeiro na conversão
    for (const item of (order as any).items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
      
      await prisma.stockTransaction.create({
        data: {
          companyId: order.companyId,
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Conversão - Pedido #${order.orderNumber}`
        }
      });
    }

    await prisma.accountReceivable.create({
      data: {
        companyId: order.companyId,
        orderId: order.id,
        description: `Venda (Conversão) - Pedido #${order.orderNumber}`,
        amount: order.netAmount,
        status: 'PENDENTE',
        dueDate: new Date()
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao converter pedido' });
  }
});

export default router;
