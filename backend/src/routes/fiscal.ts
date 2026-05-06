import { Router } from 'express';
import { acbrService } from '../services/acbrService';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Configuração de Upload de Certificado (Multi-empresa)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.body.companyId || 'default';
    const certDir = path.join(process.cwd(), 'acbr', 'certs', companyId);
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }
    cb(null, certDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'cert.pfx');
  }
});

const upload = multer({ storage });

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

// Configuração da Empresa e Certificado (Persistência Local por Empresa)
router.post('/company/setup', upload.single('certificado'), async (req, res) => {
  try {
    const config = req.body;
    const companyId = config.companyId || config.id;
    
    if (!companyId) return res.status(400).json({ error: "companyId é obrigatório" });

    const configDir = path.join(process.cwd(), 'acbr', 'config', companyId);
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    
    const configPath = path.join(configDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    res.json({ 
      success: true, 
      message: `Configurações da empresa ${companyId} salvas na VPS!`,
      certPath: req.file ? req.file.path : 'mantido'
    });
  } catch (error: any) {
    console.error("Erro ao salvar config na VPS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buscar Configuração Atual de uma empresa específica
router.get('/company/setup/current', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId é obrigatório" });

    const configPath = path.join(process.cwd(), 'acbr', 'config', String(companyId), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(config);
    } else {
      res.status(404).json({ message: "Configuração não encontrada para esta empresa" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao ler configurações" });
  }
});

// Buscar informações do certificado
router.get('/company/cert-info', async (req, res) => {
  try {
    const { companyId, senhaCertificado } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId é obrigatório" });

    const configPath = path.join(process.cwd(), 'acbr', 'config', String(companyId), 'config.json');
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Tenta ler a data de vencimento
    const vencimento = await acbrService.getCertDate({ 
      id: companyId, 
      senhaCertificado: senhaCertificado || (config as any).senhaCertificado 
    });

    res.json({ vencimento });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
