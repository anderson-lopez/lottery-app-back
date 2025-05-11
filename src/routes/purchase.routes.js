import express from 'express';
import Purchase from '../models/purchase.model.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// Obtener todas las compras (solo admin)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.status(200).json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener compras' });
  }
});

export default router;