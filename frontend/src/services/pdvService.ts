import axios from 'axios';

const API_URL = 'http://localhost:3333/api';
const OFFLINE_KEY = 'nferio_offline_sales';

export const pdvService = {
  async saveSale(saleData: any) {
    try {
      // Tenta enviar para a API
      const res = await axios.post(`${API_URL}/orders`, saleData);
      return { success: true, data: res.data, offline: false };
    } catch (error) {
      // Se falhar (offline), salva no localStorage
      console.warn('API indisponível. Salvando venda offline...');
      const offlineSales = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      const newSale = { 
        ...saleData, 
        id: 'off_' + Date.now(), 
        createdAt: new Date().toISOString(),
        offline: true 
      };
      offlineSales.push(newSale);
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(offlineSales));
      return { success: true, data: newSale, offline: true };
    }
  },

  async syncOfflineSales() {
    const offlineSales = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
    if (offlineSales.length === 0) return { synced: 0 };

    const syncedIds: string[] = [];
    for (const sale of offlineSales) {
      try {
        await axios.post(`${API_URL}/orders`, {
          ...sale,
          offline: undefined,
          id: undefined // Deixa o servidor gerar o ID real
        });
        syncedIds.push(sale.id);
      } catch (error) {
        console.error('Falha ao sincronizar venda:', sale.id);
      }
    }

    const remaining = offlineSales.filter((s: any) => !syncedIds.includes(s.id));
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));

    return { synced: syncedIds.length, remaining: remaining.length };
  },

  getOfflineCount() {
    const offlineSales = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
    return offlineSales.length;
  }
};
