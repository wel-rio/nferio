import axios from 'axios';

// URL do Backend - Altere para a URL da Cloudflare quando publicar
// URL do Backend Fiscal (VPS via Túnel Seguro)
// URL do Backend Fiscal (VPS) - Apenas para a parte fiscal
export const FISCAL_URL = 'http://147.15.107.54:3000/api';

// No Cloudflare usamos caminhos relativos para as Functions
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Instância separada apenas para o fiscal (VPS ACBr)
export const fiscalApi = axios.create({
  baseURL: FISCAL_URL,
});

export default api;
