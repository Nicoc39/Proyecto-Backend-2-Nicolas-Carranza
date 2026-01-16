import { verifyToken, extractToken } from '../utils/jwtUtils.js';
import User from '../models/User.js';

/**
 * Middleware para verificar autenticación con JWT
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar token
    const decoded = verifyToken(token);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.id).populate('cart');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos de administrador'
    });
  }

  next();
};