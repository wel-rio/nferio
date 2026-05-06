import axios from 'axios';

// URL do Backend - Altere para a URL da Cloudflare quando publicar
// URL do Backend Fiscal (VPS via Túnel Seguro)
export const FISCAL_URL = 'https://watches-colorado-alerts-pathology.trycloudflare.com/api';

// URL da API Geral: No Cloudflare é relativo, no localhost usamos o VPS temporariamente
const isLocal = window.location.hostname === 'localhost';
const API_URL = isLocal ? FISCAL_URL : '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Criamos uma instância separada apenas para o fiscal
export const fiscalApi = axios.create({
  baseURL: FISCAL_URL,
});

export default api;
