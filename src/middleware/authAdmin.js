import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js'; // Asegúrate de importar el modelo correcto

export const verifyAdminToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aquí consultamos el usuario real por su ID
    const user = await Admin.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Inyectamos los datos actualizados
    req.admin = {
      id: user._id,
      email: user.email,
      role: user.role,
      code: user.code,
      fullname: user.fullname,
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ msg: 'Token inválido' });
  }
};
