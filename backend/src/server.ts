import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import fiscalRoutes from './routes/fiscal';
import userRoutes from './routes/users';
import financeRoutes from './routes/finance';
import configRoutes from './routes/config';
import companyRoutes from './routes/company';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customers';
import stockRoutes from './routes/stock';
import ncmRoutes from './routes/ncm';

import { acbrService } from './services/acbrService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3333;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NFERIO ERP API is running' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/config', configRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/ncm', ncmRoutes);

// Inicializa a ACBrLib ao subir o servidor
acbrService.checkEnvironment().then(ready => {
  if (ready) {
    console.log('🚀 ACBrLib pronta para uso no backend.');
  } else {
    console.warn('⚠️ Backend iniciado, mas ACBrLib NÃO está disponível.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
