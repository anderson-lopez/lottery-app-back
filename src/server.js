import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import packageRoutes from './routes/package.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import raffleRoutes from './routes/raffleAdmin.route.js';
import lotteryRoutes from './routes/lotterySettings.routes.js'
import settingsRoutes from './routes/settings.route.js';

dotenv.config();

const app = express();
app.use(cors({ origin: [process.env.FRONTEND_URL, process.env.PRODUCT_FRONTEND_URL] }));
app.use(express.json());

// Rutas
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/raffle', raffleRoutes);
app.use('/api/lottery', lotteryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});
app.get('/', (req, res) => {
  res.send('API de pagos en línea');
});

const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB conectado');

    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((err) => console.error('Error conectando MongoDB:', err));
