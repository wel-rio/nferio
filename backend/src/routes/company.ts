import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configuração do Multer para salvar os certificados
const certDir = '/home/ubuntu/nferio/backend/acbr/certs';

// Cria a pasta se não existir
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, certDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Salva com o ID da empresa para evitar conflitos
    const companyId = req.body.companyId || 'default';
    cb(null, `cert_${companyId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * Rota para atualizar dados da empresa e upload de certificado
 */
router.post('/setup', upload.single('certificado'), async (req: Request, res: Response) => {
  try {
    const { 
      companyId, 
      razaoSocial, 
      cnpj, 
      inscricaoEstadual, 
      municipio, 
      uf, 
      codigoIbge, 
      senhaCertificado,
      crt 
    } = req.body;

    const certificadoPath = req.file ? req.file.path : undefined;

    const company = await prisma.company.upsert({
      where: { id: companyId || '' },
      update: {
        razaoSocial,
        cnpj,
        inscricaoEstadual,
        municipio,
        uf,
        codigoIbge,
        crt,
        certificadoSenha: senhaCertificado,
        ...(certificadoPath && { certificadoPath })
      },
      create: {
        razaoSocial,
        cnpj,
        inscricaoEstadual,
        municipio,
        uf,
        codigoIbge,
        crt,
        certificadoSenha: senhaCertificado,
        certificadoPath: certificadoPath || ''
      }
    });

    res.json({
      success: true,
      message: 'Configurações salvas com sucesso!',
      company
    });
  } catch (error: any) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro interno ao salvar configurações', details: error.message });
  }
});

export default router;
