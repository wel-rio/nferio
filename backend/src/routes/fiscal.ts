import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { acbrService } from '../services/acbrService';

const router = Router();
const prisma = new PrismaClient();

// Mapeamento de Produto (Vincula nome do fornecedor ao nosso ID)
router.post('/mapping', async (req, res) => {
  const { companyId, supplierId, externalName, productId } = req.body;
  try {
    const mapping = await prisma.productMapping.upsert({
      where: {
        companyId_supplierId_externalName: { companyId, supplierId, externalName }
      },
      update: { productId },
      create: { companyId, supplierId, externalName, productId }
    });
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar mapeamento' });
  }
});

// Processar Entrada de NFe
router.post('/process-entry', async (req, res) => {
  const { companyId, nfeData } = req.body;
  // nfeData deve conter: { supplier, items, installments, nfeKey }

  try {
    // 1. Garante que o Fornecedor existe
    const supplier = await prisma.customer.upsert({
      where: { doc: nfeData.supplier.cnpj }, // doc é único no schema
      update: { type: 'BOTH' },
      create: {
        companyId,
        name: nfeData.supplier.name,
        doc: nfeData.supplier.cnpj,
        type: 'SUPPLIER',
        ie: nfeData.supplier.ie,
        address: nfeData.supplier.address,
        city: nfeData.supplier.city,
        uf: nfeData.supplier.uf
      }
    });

    // 2. Processa Itens e Estoque
    for (const item of nfeData.items) {
      if (item.productId) {
        // Atualiza estoque
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });

        // Registra movimento
        await prisma.stockTransaction.create({
          data: {
            companyId,
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            reason: `Entrada NFe: ${nfeData.nfeNumber}`
          }
        });
      }
    }

    // 3. Processa Financeiro (Contas a Pagar)
    for (const inst of nfeData.installments) {
      await prisma.accountPayable.create({
        data: {
          companyId,
          description: `Compra NFe ${nfeData.nfeNumber} - Parc ${inst.number}`,
          amount: inst.amount,
          dueDate: new Date(inst.dueDate),
          supplierName: supplier.name,
          nfeKey: nfeData.nfeKey,
          status: 'PENDING'
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar entrada fiscal' });
  }
});

// Emitir NFe usando ACBrLib Nativa
router.post('/emit-acbr', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // 1. Busca dados do pedido e empresa
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });
    
    const company = await prisma.company.findFirst();

    if (!order || !company) {
      return res.status(404).json({ error: 'Dados insuficientes (Pedido ou Empresa não encontrados)' });
    }

    // 2. Converte os dados para o formato INI da ACBr
    const { acbrConverter } = require('../utils/acbrConverter');
    const iniContent = acbrConverter.orderToIni(order, company);

    // 3. Chama a lógica de emissão real (Passando a empresa para configurar o certificado)
    const result = await acbrService.emitirNFe(iniContent, company);

    // 4. Se deu sucesso, atualiza o pedido
    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'FATURADO',
          // Aqui poderíamos salvar o XML e o Protocolo se o Prisma tiver esses campos
        }
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error("Erro na rota fiscal:", error);
    res.status(500).json({ error: 'Erro ao emitir via ACBrLib', details: error.message });
  }
});

// Rota de Teste Rápido (Acessível via Navegador)
router.get('/test-acbr', async (req, res) => {
  try {
    const versao = await acbrService.getVersao();
    res.json({
      success: true,
      mensagem: "Conexão com ACBrLib estabelecida!",
      versao: versao,
      ambiente: process.platform,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao comunicar com ACBrLib', message: error.message });
  }
});

// Mock emission for NFe/NFCe
router.post('/emit', async (req, res) => {
  try {
    const { orderId, type } = req.body; // type: 'NFE' or 'NFCE'

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Simulate ACBrLib logic:
    // 1. Load Certificate
    // 2. Generate XML
    // 3. Sign and Transmit
    
    console.log(`Simulando emissão de ${type} para o Pedido #${order.orderNumber}`);

    // Update order status to FATURADO
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'FATURADO' }
    });

    res.json({
      success: true,
      message: `${type} emitida com sucesso! (Simulado)`,
      xml: '<xml>...</xml>',
      danfe_url: 'https://example.com/danfe.pdf',
      protocol: '135240001234567'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao emitir nota fiscal' });
  }
});

// List issued notes
router.get('/history', async (req, res) => {
  try {
    // In a real system, we would have a 'FiscalNote' model
    // For now, let's return orders with status 'FATURADO'
    const notes = await prisma.order.findMany({
      where: { status: 'FATURADO' },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico fiscal' });
  }
});

export default router;
