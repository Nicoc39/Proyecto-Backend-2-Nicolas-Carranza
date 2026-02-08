import CartDAO from '../daos/cartDAO.js';

/**
 * CartController - Controlador para carritos
 * Responsabilidad: Manejar lógica de solicitudes/respuestas para carritos
 */

class CartController {
  /**
   * Obtener carrito del usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getCart(req, res) {
    try {
      console.log('📋 Obteniendo carrito para usuario:', req.user._id);

      const cart = await CartDAO.getUserCart(req.user._id);

      // Filtrar productos inválidos (donde product es null)
      if (cart && cart.products) {
        cart.products = cart.products.filter(item => item.product !== null);
      }

      res.json({
        status: 'success',
        cart
      });
    } catch (error) {
      console.error('❌ Error en controlador - getCart:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener carrito'
      });
    }
  }

  /**
   * Agregar producto al carrito
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      console.log('📦 Intentando agregar al carrito:', {
        userId: req.user._id,
        productId,
        quantity
      });

      if (!productId) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de producto requerido'
        });
      }

      const cart = await CartDAO.addToCart(req.user._id, productId, quantity);

      console.log(`✓ Producto ${productId} agregado al carrito del usuario ${req.user._id}`);

      res.json({
        status: 'success',
        message: 'Producto agregado al carrito',
        cart
      });
    } catch (error) {
      console.error('❌ Error en controlador - addToCart:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al agregar al carrito'
      });
    }
  }

  /**
   * Eliminar producto del carrito
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async removeFromCart(req, res) {
    try {
      const { productId } = req.params;

      console.log('🗑️ Eliminando producto:', productId);

      const cart = await CartDAO.removeFromCart(req.user._id, productId);

      console.log('✓ Producto eliminado');

      res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        cart
      });
    } catch (error) {
      console.error('❌ Error en controlador - removeFromCart:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al eliminar del carrito'
      });
    }
  }

  /**
   * Actualizar cantidad de producto en el carrito
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async updateQuantity(req, res) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      console.log('🔄 Actualizando cantidad:', { productId, quantity });

      if (quantity < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad debe ser mayor a 0'
        });
      }

      const cart = await CartDAO.updateCartQuantity(req.user._id, productId, quantity);

      console.log('✓ Cantidad actualizada');

      res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        cart
      });
    } catch (error) {
      console.error('❌ Error en controlador - updateQuantity:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al actualizar carrito'
      });
    }
  }

  /**
   * Vaciar carrito
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async clearCart(req, res) {
    try {
      console.log('🗑️ Vaciando carrito del usuario:', req.user._id);

      const cart = await CartDAO.clearCart(req.user._id);

      console.log('✓ Carrito vaciado');

      res.json({
        status: 'success',
        message: 'Carrito vaciado',
        cart
      });
    } catch (error) {
      console.error('❌ Error en controlador - clearCart:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al vaciar carrito'
      });
    }
  }
}

export default CartController;
