import { verifyToken, extractToken } from '../utils/jwtUtils.js';
import User from '../models/user.model.js';

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

/**
 * Middleware para verificar que sea usuario regular (no admin)
 */
export const userOnlyMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  // Permitir que usuarios normales y admins accedan
  // pero si quieres solo usuarios, descomenta:
  // if (req.user.role === 'admin') {
  //   return res.status(403).json({
  //     status: 'error',
  //     message: 'Los administradores no pueden usar esta funcionalidad'
  //   });
  // }

  next();
};

/**
 * Middleware de autorización basado en roles
 * @param {Array<String>} allowedRoles - Roles permitidos
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para endpoints que requieren JWT
 */
export const requireJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token requerido'
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.id || decoded._id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
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
 * Middleware para solo administradores con JWT
 */
export const adminOnlyJWT = [
  requireJWT,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo administradores pueden acceder a este recurso'
      });
    }
    next();
  }
];

/**
 * Middleware combinado para usuario autenticado
 */
export const authenticatedUserJWT = [
  requireJWT,
  (req, res, next) => {
    // Cualquier usuario autenticado puede pasar
    next();
  }
];