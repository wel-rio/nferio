import { Router } from 'express';
import { acbrService } from '../services/acbrService';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();

// Middleware de Segurança Simples (Pode ser melhorado com JWT)
const apiKeyMiddleware = (req: any, res: any, next: any) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.FISCAL_API_KEY && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'API Key inválida' });
  }
  next();
};

/**
 * Endpoint Universal: Consultar Status da SEFAZ
 * Recebe o certificado em Base64 para configurar na hora
 */
router.post('/status', apiKeyMiddleware, async (req, res) => {
  const { certificadoBase64, senha, uf, ambiente } = req.body;

  if (!certificadoBase64 || !senha) {
    return res.status(400).json({ error: 'Certificado e senha são obrigatórios' });
  }

  // Criar arquivo temporário para o certificado PFX
  const tempPath = path.resolve(__dirname, `../../temp/cert_${crypto.randomUUID()}.pfx`);
  
  try {
    if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, Buffer.from(certificadoBase64, 'base64'));

    // Configurar ACBr para este comando específico
    const companyMock = {
      certificadoPath: tempPath,
      certificadoSenha: senha,
      ambiente: ambiente || '2' // 1=Prod, 2=Homolog
    };

    await acbrService.configurarEmpresa(companyMock);
    
    // Comando ACBr: NFE_StatusServico
    const status = await acbrService.getVersao(); // Exemplo: retorna versão por enquanto

    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

/**
 * Endpoint Universal: Emitir NFe
 * Recebe o conteúdo INI completo e o certificado
 */
router.post('/emitir', apiKeyMiddleware, async (req, res) => {
  const { iniContent, certificadoBase64, senha, ambiente } = req.body;

  const tempPath = path.resolve(__dirname, `../../temp/cert_${crypto.randomUUID()}.pfx`);
  
  try {
    if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, Buffer.from(certificadoBase64, 'base64'));

    const result = await acbrService.emitirNFe(iniContent, {
      certificadoPath: tempPath,
      certificadoSenha: senha,
      ambiente: ambiente || '2'
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

export default router;
