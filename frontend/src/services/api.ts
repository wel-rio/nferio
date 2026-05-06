import axios from 'axios';

// URL do Backend - Altere para a URL da Cloudflare quando publicar
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;
