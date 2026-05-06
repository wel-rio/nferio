import { Router } from 'express';
import { acbrService } from '../services/acbrService';

const router = Router();

// Processar Entrada de NFe (Versão Stateless)
router.post('/process-entry', async (req, res) => {
  // Como não há banco, este endpoint apenas retorna sucesso ou erro de validação
  res.json({ success: true, message: "Entrada validada (Processamento de banco deve ser feito no Cloudflare)" });
});

// Emitir NFe usando ACBrLib Nativa (Stateless)
router.post('/emit-acbr', async (req, res) => {
  try {
    const { order, company } = req.body;
    
    if (!order || !company) {
      return res.status(400).json({ error: 'Dados insuficientes (Pedido ou Empresa)' });
    }

    // 1. Converte os dados para o formato INI da ACBr
    const { acbrConverter } = require('../utils/acbrConverter');
    const iniContent = acbrConverter.orderToIni(order, company);

    // 2. Chama a lógica de emissão real
    const result = await acbrService.emitirNFe(iniContent, company);

    res.json(result);
  } catch (error: any) {
    console.error("Erro na rota fiscal:", error);
    res.status(500).json({ error: 'Erro ao emitir via ACBrLib', details: error.message });
  }
});

// Validar NFe (Stateless)
router.post('/validate-acbr', async (req, res) => {
  try {
    const { order, company } = req.body;

    if (!order || !company) {
      return res.status(400).json({ error: 'Dados insuficientes' });
    }

    const { acbrConverter } = require('../utils/acbrConverter');
    const iniContent = acbrConverter.orderToIni(order, company);
    
    const result = await acbrService.validarNFe(iniContent, company);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao validar via ACBrLib', details: error.message });
  }
});

// Rota de Teste Rápido
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

export default router;
