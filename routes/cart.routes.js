import { Router } from 'express';
import CartController from '../controllers/cartController.js';
import AuthorizationService from '../services/authorizationService.js';
import { verifyToken } from '../utils/jwtUtils.js';
import User from '../models/user.model.js';

const router = Router();

// Middleware para autenticación con JWT
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado - Token faltante'
    });
  }

  try {
    const decoded = verifyToken(token);
    console.log('✓ Token decodificado:', decoded);

    // Buscar usuario completo en la base de datos
    const user = await User.findById(decoded.id || decoded._id).populate('cart');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    req.user = user;
    console.log('✓ Usuario autenticado:', req.user._id);
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

/**
 * Rutas del Carrito
 * Requieren autenticación JWT
 */

// Obtener carrito del usuario
router.get('/', authenticateJWT, CartController.getCart);

// Agregar producto al carrito (solo usuarios)
router.post('/add', authenticateJWT, (req, res, next) => {
  // Validar autorización
  const auth = AuthorizationService.validatePermission(req.user, 'add-to-cart');
  if (!auth.authorized) {
    return res.status(403).json({
      status: 'error',
      message: auth.message
    });
  }
  next();
}, CartController.addToCart);

// Eliminar producto del carrito
router.delete('/remove/:productId', authenticateJWT, CartController.removeFromCart);

// Actualizar cantidad de producto
router.put('/update/:productId', authenticateJWT, CartController.updateQuantity);

// Vaciar carrito
router.delete('/clear', authenticateJWT, CartController.clearCart);

export default router;