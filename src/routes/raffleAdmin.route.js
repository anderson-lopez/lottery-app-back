import express from 'express';
import RaffleNumber from '../models/raffleNumbers.model.js';

const router = express.Router();

//Obtener Premios instantáneos
router.get('/instant-prizes', async (req, res) => {
  try {
    const prizes = await RaffleNumber.find({ prizeAmount: { $exists: true } })
      .sort({ number: 1}); // Puedes cambiar el orden si prefieres aleatorio

    res.status(200).json(prizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener premios' });
  }
});

// Crear 99,999 números
router.post('/generate-raffle-numbers', async (req, res) => {
  try {
    const count = await RaffleNumber.countDocuments();
    if (count > 0) {
      return res.status(400).json({ msg: `Ya existen ${count} números. Borra antes de generar nuevos.` });
    }

    const bulk = [];
    for (let i = 0; i < 99999; i++) {
      bulk.push({ number: i.toString().padStart(5, '0') });
    }

    await RaffleNumber.insertMany(bulk);
    res.status(201).json({ msg: '✅ Números de rifa creados correctamente', total: 99999 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear los números de rifa' });
  }
});

//Obtener el progreso de la rifa
router.get('/raffle-progress', async (req, res) => {
  try {
    const total = await RaffleNumber.countDocuments();
    const assigned = await RaffleNumber.countDocuments({ status: 'assigned' });

    if (total === 0) {
      return res.status(200).json({
        total,
        assigned,
        percentage: 0
      });
    }

    const percentage = ((assigned / total) * 100).toFixed(2);

    res.status(200).json({
      total,
      assigned,
      percentage: Number(percentage)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener el progreso de la rifa' });
  }
});

// Obtener todos los números (opcionalmente filtrados por status)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 1000, skip = 0 } = req.query;

    const query = {};
    if (status === 'available' || status === 'assigned') {
      query.status = status;
    }

    const numbers = await RaffleNumber.find(query)
      .sort({ number: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await RaffleNumber.countDocuments(query);

    res.status(200).json({ total, numbers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener los números' });
  }
});

//Actualizar el estado de un número
router.put('/:id', async (req, res) => {
  try {
    const { prizeAmount, delivered } = req.body;

    const updated = await RaffleNumber.findByIdAndUpdate(
      req.params.id,
      { $set: { prizeAmount, delivered } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Número no encontrado' });

    res.json({ msg: 'Número actualizado', number: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el número' });
  }
});


// Asignar premios aleatorios a 10 números
router.post('/assign-random-prizes', async (req, res) => {

  const alreadyAssigned = await RaffleNumber.countDocuments({ prizeAmount: { $exists: true } });
  if (alreadyAssigned > 0) {
    return res.status(400).json({ msg: 'Ya existen premios asignados. Elimina primero si deseas reiniciar.' });
  }

  try {
    const { prizes } = req.body; // Ejemplo: [{ amount: 100 }, { amount: 200 }, ...]

    if (!Array.isArray(prizes) || prizes.length !== 10) {
      return res.status(400).json({ msg: 'Debes enviar un array con exactamente 10 premios' });
    }

    const numbers = await RaffleNumber.aggregate([
      { $match: { status: 'available', prizeAmount: { $exists: false } } },
      { $sample: { size: 10 } }
    ]);

    if (numbers.length < 10) {
      return res.status(400).json({ msg: 'No hay suficientes números disponibles para asignar premios' });
    }

    const updates = [];

    for (let i = 0; i < 10; i++) {
      updates.push(RaffleNumber.findByIdAndUpdate(numbers[i]._id, {
        $set: { prizeAmount: prizes[i].amount }
      }));
    }

    await Promise.all(updates);
    res.status(200).json({ msg: 'Premios asignados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al asignar premios' });
  }
});

// Eliminar todos los números
router.delete('/delete-raffle-numbers', async (req, res) => {
  try {
    const deleted = await RaffleNumber.deleteMany({});
    res.status(200).json({
      msg: '🗑️ Números eliminados correctamente',
      deletedCount: deleted.deletedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al eliminar los números' });
  }
});


export default router;