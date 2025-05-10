import express from 'express';
import { loginAdmin, registerAdmin } from '../controllers/adminController.js';


const router = express.Router();

router.post('/register', registerAdmin); // Registrar nuevo admin
router.post('/login', loginAdmin); // Login de admin


// Solo admins pueden crear más admins

export default router;