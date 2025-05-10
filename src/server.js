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
app.get('/', (req, res) => {
  res.send('API de pagos en línea');
});


// DB + servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(process.env.PORT, () => console.log(`Servidor en puerto ${process.env.PORT}`));
  })
  .catch((err) => console.error('Error conectando MongoDB:', err));
