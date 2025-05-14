import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const generateResellerCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // Ej: 'A1B2C3'
};

// Registrar nuevo admin o revendedor
export const registerAdmin = async (req, res) => {
  const { email, password, role = 'admin', code, name } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ msg: 'Este admin ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalCode = code || generateResellerCode();

    // Verificar si el código ya existe
    const codeExists = await Admin.findOne({ code: finalCode });
    if (codeExists) {
      return res.status(400).json({ msg: 'El código ya está en uso' });
    }

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role,
      code: finalCode, 
      fullname: name
    });

    await newAdmin.save();

    res.status(201).json({
      msg: 'Admin creado correctamente',
      code: finalCode
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error al registrar admin', error: err.message });
  }
};

// Login de admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Error en login', error: err.message });
  }
};