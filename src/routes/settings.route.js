import express from 'express';
import Settings from '../models/settings.model.js';

const router = express.Router();

// Obtener configuración
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración', error });
  }
});

// Crear configuración
router.post('/', async (req, res) => {
  try {
    const existing = await Settings.findOne();
    if (existing) {
      return res.status(202).json({
        message: 'Ya existe una configuración. Por favor, actualice la existente.'
      });
    }

    const settings = new Settings(req.body);
    await settings.save();
    res.status(201).json(settings);
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear configuración',
      error,
    });
  }
});

// Actualizar configuración existente
router.put('/:id', async (req, res) => {
  try {
    const updated = await Settings.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración', error });
  }
});

// (Opcional) Eliminar configuración
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Settings.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json({ message: 'Configuración eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar configuración', error });
  }
});

export default router;
