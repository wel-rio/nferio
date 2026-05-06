import api from './api';

export const pdvService = {
  getProducts: async () => {
    const res = await api.get('/products');
    return res.data;
  },
  
  createOrder: async (order: any) => {
    const res = await api.post('/orders', order);
    return res.data;
  }
};
