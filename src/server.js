// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payments.routes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
// Rutas
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});
app.get('/', (req, res) => {
  res.send('API de pagos en línea');
});

const PORT = process.env.PORT || 5000;

// DB + servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((err) => console.error('Error conectando MongoDB:', err));
