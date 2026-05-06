import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fiscalRoutes from './routes/fiscal';
import universalFiscalRoutes from './routes/universal_fiscal';
import { acbrService } from './services/acbrService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rota de saúde focada no Motor Fiscal
app.get('/api/health', async (req, res) => {
  const acbrReady = await acbrService.checkEnvironment();
  res.json({ 
    status: 'ok', 
    service: 'NFERIO FISCAL SERVICE',
    acbr: {
      ready: acbrReady,
      status: acbrReady ? 'OPERACIONAL' : 'NÃO INICIALIZADO'
    },
    vps: {
      uptime: process.uptime(),
      platform: process.platform
    }
  });
});

// Rotas do projeto NFERIO
app.use('/api/fiscal', fiscalRoutes);

// Rotas da API UNIVERSAL (Para outros projetos)
app.use('/api/v1/nfe', universalFiscalRoutes);

// Inicializa a ACBrLib ao subir o servidor
acbrService.checkEnvironment().then(ready => {
  if (ready) {
    console.log('🚀 MOTOR FISCAL ATIVO: Pronto para validar e emitir notas.');
  } else {
    console.warn('⚠️ ALERTA: Motor fiscal não inicializado. Verifique as dependências ACBrLib.');
  }
});

app.listen(PORT, () => {
  console.log(`[FISCAL SERVICE] Rodando na porta ${PORT}`);
});
