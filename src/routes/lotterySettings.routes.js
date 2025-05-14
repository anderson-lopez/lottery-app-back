// routes/lotterySettings.routes.js
import express from 'express';
import LotterySettings from '../models/lotterySettings.model.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// GET (puede ser público si quieres mostrarlo en frontend)
router.get('/', async (req, res) => {
  try {
    const settings = await LotterySettings.findOne().sort({ createdAt: -1 });
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener configuración del sorteo' });
  }
});

// POST (solo admin)
router.post('/', verifyAdminToken, async (req, res) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ msg: 'No autorizado' });
  }

  const { name, prize, pricePerNumber, imageUrl, endDate } = req.body;

  try {
    const existing = await LotterySettings.findOne().sort({ createdAt: -1 });

    if (existing) {
      return res.status(400).json({ msg: 'Ya existe una configuración. Usa PUT para actualizarla.' });
    }

    const newSettings = new LotterySettings({ name, prize, pricePerNumber, imageUrl, endDate});
    await newSettings.save();

    res.status(201).json({ msg: 'Configuración creada', settings: newSettings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear configuración' });
  }
});

// PUT (solo admin)
router.put('/', verifyAdminToken, async (req, res) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ msg: 'No autorizado' });
  }

  const { name, prize, pricePerNumber, imageUrl, endDate } = req.body;

  try {
    let settings = await LotterySettings.findOne().sort({ createdAt: -1 });

    if (!settings) {
      settings = new LotterySettings({ name, prize, pricePerNumber, imageUrl, endDate });
    } else {
      settings.name = name;
      settings.prize = prize;
      settings.pricePerNumber = pricePerNumber;
      settings.imageUrl = imageUrl;
      settings.endDate = endDate;
    }

    await settings.save();
    res.status(200).json({ msg: 'Configuración actualizada', settings });
  } catch (err) {
    res.status(500).json({ msg: 'Error al actualizar configuración' });
  }
});

export default router;
