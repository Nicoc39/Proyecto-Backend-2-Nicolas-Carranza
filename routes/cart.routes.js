import { Router } from 'express';
import User from '../models/user.model.js';
import Cart from '../models/cart.js';
import { verifyToken } from '../utils/jwtUtils.js';

const router = Router();

// Middleware para autenticación con JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      status: 'error', 
      message: 'No autorizado - Token faltante' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ 
      status: 'error', 
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

// Obtener carrito del usuario
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart',
      populate: {
        path: 'products.product'
      }
    }).lean();

    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Usuario no encontrado' 
      });
    }

    if (!user.cart) {
      return res.json({ 
        status: 'success', 
        cart: {
          _id: null,
          products: []
        }
      });
    }

    res.json({ 
      status: 'success', 
      cart: user.cart
    });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener carrito',
      error: error.message
    });
  }
});

// Agregar producto al carrito
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    console.log('📦 Intentando agregar al carrito:', { userId: req.user.id, productId, quantity });

    if (!productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'ID de producto requerido' 
      });
    }

    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Usuario no encontrado' 
      });
    }

    // Si el usuario no tiene carrito, crear uno
    if (!user.cart) {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      user.cart = newCart._id;
      await user.save();
      console.log('✓ Carrito creado:', newCart._id);
    }

    // Obtener el carrito
    let cart = await Cart.findById(user.cart);

    if (!cart) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Carrito no encontrado' 
      });
    }

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => 
      p.product.toString() === productId
    );

    if (existingProduct) {
      // Si existe, incrementar cantidad
      existingProduct.quantity += quantity;
      console.log('✓ Cantidad actualizada:', existingProduct.quantity);
    } else {
      // Si no existe, agregar nuevo
      cart.products.push({
        product: productId,
        quantity
      });
      console.log('✓ Nuevo producto agregado');
    }

    await cart.save();

    console.log(`✓ Producto ${productId} agregado al carrito del usuario ${req.user.id}`);

    res.json({ 
      status: 'success', 
      message: 'Producto agregado al carrito',
      cart
    });
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al agregar al carrito',
      error: error.message
    });
  }
});

// Eliminar producto del carrito
router.delete('/remove/:productId', authenticateJWT, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user || !user.cart) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Carrito no encontrado' 
      });
    }

    const cart = await Cart.findById(user.cart);

    // Filtrar el producto a eliminar
    cart.products = cart.products.filter(p => 
      p.product.toString() !== productId
    );

    await cart.save();

    res.json({ 
      status: 'success', 
      message: 'Producto eliminado del carrito',
      cart
    });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al eliminar del carrito' 
    });
  }
});

// Actualizar cantidad de producto
router.put('/update/:productId', authenticateJWT, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Cantidad debe ser mayor a 0' 
      });
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.cart) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Carrito no encontrado' 
      });
    }

    const cart = await Cart.findById(user.cart);
    const product = cart.products.find(p => 
      p.product.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Producto no encontrado en carrito' 
      });
    }

    product.quantity = quantity;
    await cart.save();

    res.json({ 
      status: 'success', 
      message: 'Cantidad actualizada',
      cart
    });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al actualizar carrito' 
    });
  }
});

// Vaciar carrito
router.delete('/clear', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.cart) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Carrito no encontrado' 
      });
    }

    const cart = await Cart.findById(user.cart);
    cart.products = [];
    await cart.save();

    res.json({ 
      status: 'success', 
      message: 'Carrito vaciado',
      cart
    });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al vaciar carrito' 
    });
  }
});

export default router;
