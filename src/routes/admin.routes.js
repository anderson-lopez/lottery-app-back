import express from 'express';
import { loginAdmin, registerAdmin } from '../controllers/adminController.js';
import Admin from '../models/Admin.js';
import { verifyAdminToken } from '../middleware/authAdmin.js';


const router = express.Router();

router.post('/register', registerAdmin); // Registrar nuevo admin
router.post('/login', loginAdmin); // Login de admin
router.get('/', async (req, res) => {
  const response = await Admin.find();
  res.json(response); 
});
router.get('/me', verifyAdminToken, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select('-password'); // excluye el password
    if (!admin) {
      return res.status(404).json({ msg: 'Admin no encontrado' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener admin', error: err.message });
  }
});

// Solo admins pueden crear más admins

export default router;