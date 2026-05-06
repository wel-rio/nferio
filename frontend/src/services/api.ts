import axios from 'axios';

// URL do Backend - Altere para a URL da Cloudflare quando publicar
// URL do Backend Fiscal (VPS via Túnel Seguro)
// URL do Backend Fiscal (VPS) - COLE AQUI O ENDEREÇO QUE APARECE NO TERMINAL DA VPS
export const FISCAL_URL = 'https://SUA-URL-DO-TUNEL.trycloudflare.com/api';

// URL da API Geral: No Cloudflare é relativo, no localhost usamos a produção para testes
const isLocal = window.location.hostname === 'localhost';
const API_URL = isLocal ? 'https://nferio.pages.dev/api' : '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Instância separada apenas para o fiscal (VPS ACBr)
export const fiscalApi = axios.create({
  baseURL: FISCAL_URL,
});

export default api;
