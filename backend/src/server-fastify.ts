import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { acbrService } from './services/acbrService';
import { convertToIni } from './utils/acbrConverter';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ 
  logger: true,
  bodyLimit: 10 * 1024 * 1024 // 10MB para suportar certificados e payloads grandes
});

// Configurações
fastify.register(cors, { origin: '*' });
fastify.register(multipart, { attachFieldsToBody: true });

// Registro de JWT (Validando contra o segredo do Supabase)
fastify.register(jwt, {
  secret: process.env.SUPABASE_JWT_SECRET || 'fallback-secret-deve-ser-o-do-supabase'
});

/**
 * Middleware de Autenticação
 */
fastify.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

/**
 * Rotas Fiscais
 */
fastify.get('/api/fiscal/status', async () => {
  return { status: 'online', service: 'NFERIO Gateway Fiscal' };
});

// Rota de Emissão Stateless (Recebe tudo e processa)
fastify.post('/api/fiscal/emit-stateless', { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const parts = request.body;
  
  try {
    // 1. Extrair dados
    const order = JSON.parse(parts.order.value);
    const company = JSON.parse(parts.company.value);
    const certFile = parts.certificado; // Buffer do arquivo
    
    if (!certFile) throw new Error("Certificado PFX não enviado");

    // 2. Converter para INI
    const iniContent = convertToIni(order, company);

    // 3. Processar Emissão
    const result = await acbrService.emitirNFe(iniContent, company, certFile.toBuffer());

    return result;
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ success: false, error: error.message });
  }
});

// Nova rota para pegar informações do certificado (vencimento) sem salvar nada
fastify.post('/api/fiscal/cert-info', { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
  const parts = request.body;
  try {
    const company = JSON.parse(parts.company.value);
    const certFile = parts.certificado;
    
    return await acbrService.runSafe(company, certFile.toBuffer(), async () => {
      const buffer = Buffer.alloc(256);
      const size = new Int32Array([256]);
      acbrService.functions.NFE_ObterCertificadoDataVencimento(buffer, size);
      return { success: true, expiration: buffer.toString('utf8').replace(/\0/g, '').trim() };
    });
  } catch (error: any) {
    return reply.status(500).send({ success: false, error: error.message });
  }
});

// Rota de compatibilidade para a tela de Configurações (apenas retorna OK, pois agora é stateless)
fastify.post('/api/fiscal/config', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
  return { success: true, message: 'Configuração stateless processada com sucesso' };
});

// Início do Servidor
const start = async () => {
  try {
    const port = Number(process.env.FISCAL_PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Gateway Fiscal rodando em: http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
