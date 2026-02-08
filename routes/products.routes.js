import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { requireJWT, adminOnlyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Inicializar productos en la BD
ProductController.initializeProducts();

/**
 * Rutas Públicas (sin autenticación)
 */

// Obtener todos los productos
router.get('/', ProductController.getAllProducts);

// Obtener producto por ID
router.get('/:id', ProductController.getProductById);

/**
 * Rutas Solo Administrador
 */

// Crear producto (solo admin)
router.post('/', requireJWT, ...adminOnlyJWT, ProductController.createProduct);

// Actualizar producto (solo admin)
router.put('/:id', requireJWT, ...adminOnlyJWT, ProductController.updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', requireJWT, ...adminOnlyJWT, ProductController.deleteProduct);

export default router;