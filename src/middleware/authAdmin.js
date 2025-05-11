import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Puedes agregar más validaciones si deseas
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};
