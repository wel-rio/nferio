import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { acbrService } from '../services/acbrService';

const router = Router();
const prisma = new PrismaClient();

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
