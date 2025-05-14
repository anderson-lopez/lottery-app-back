import express from 'express';
import Purchase from '../models/purchase.model.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';
import RaffleNumber from '../models/raffleNumbers.model.js';

const router = express.Router();

// Obtener todas las compras (solo admin)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    let purchases;

    if (req.admin.role === 'admin') {
      // Si es administrador, obtener todas las compras
      purchases = await Purchase.find().sort({ createdAt: -1 });
    } else if (req.admin.role === 'reseller') {
      // Si es revendedor, filtrar por resellerCode
      purchases = await Purchase.find({ resellerCode: req.admin.code }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    res.status(200).json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener compras' });
  }
});

export default router;