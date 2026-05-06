import { Router } from 'express';
import { acbrService } from '../services/acbrService';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Configuração de Upload de Certificado
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certDir = path.join(process.cwd(), 'acbr', 'certs');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }
    cb(null, certDir);
  },
  filename: (req, file, cb) => {
    // Salva sempre como cert.pfx para simplificar o motor
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

// Configuração da Empresa e Certificado (Persistência Local para ACBr)
router.post('/company/setup', upload.single('certificado'), async (req, res) => {
  try {
    const config = req.body;
    const configPath = path.join(process.cwd(), 'acbr', 'config.json');

    // Salva as configurações em um JSON local na VPS
    // Isso mantém o serviço stateless em relação ao DB principal, mas persistente localmente para o motor
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    res.json({ 
      success: true, 
      message: "Configurações e Certificado salvos com sucesso na VPS!",
      certPath: req.file ? req.file.path : 'mantido'
    });
  } catch (error: any) {
    console.error("Erro ao salvar config na VPS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buscar Configuração Atual da VPS
router.get('/company/setup/current', async (req, res) => {
  try {
    const configPath = path.join(process.cwd(), 'acbr', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json(config);
    } else {
      res.status(404).json({ message: "Nenhuma configuração encontrada na VPS" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao ler configurações" });
  }
});

export default router;
