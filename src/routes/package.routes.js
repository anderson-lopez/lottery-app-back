import express from 'express';
import Package from '../models/package.model.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';

const router = express.Router();

// Crear paquete (solo admin)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    const saved = await newPackage.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ msg: 'Error al crear paquete', error: err.message });
  }
});

// Obtener todos los paquetes (público)
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener paquetes' });
  }
});

// Actualizar paquete (solo admin)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const updated = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Error al actualizar paquete' });
  }
});

// Eliminar paquete (solo admin)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Paquete eliminado' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar paquete' });
  }
});

export default router;
