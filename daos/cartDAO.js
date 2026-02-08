import User from '../models/user.model.js';
import Cart from '../models/cart.js';

/**
 * CartDAO - Data Access Object para carritos
 * Responsabilidad: Acceso a base de datos para operaciones con carritos
 */

class CartDAO {
  /**
   * Obtener carrito del usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object>} - Carrito del usuario
   */
  static async getUserCart(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: 'cart',
        populate: {
          path: 'products.product'
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.cart) {
        console.log('📦 Usuario no tiene carrito');
        return {
          _id: null,
          products: []
        };
      }

      console.log('📦 Carrito del usuario:', JSON.stringify(user.cart, null, 2));
      return user.cart.toObject ? user.cart.toObject() : user.cart;
    } catch (error) {
      console.error('❌ Error en DAO - getUserCart:', error);
      throw new Error('Error al obtener carrito de la base de datos');
    }
  }

  /**
   * Crear un nuevo carrito
   * @returns {Promise<Object>} - Carrito creado
   */
  static async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      return await newCart.save();
    } catch (error) {
      console.error('❌ Error en DAO - createCart:', error);
      throw new Error('Error al crear carrito en la base de datos');
    }
  }

  /**
   * Obtener carrito por ID
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Object>} - Carrito encontrado
   */
  static async getCartById(cartId) {
    try {
      return await Cart.findById(cartId).populate('products.product');
    } catch (error) {
      console.error('❌ Error en DAO - getCartById:', error);
      throw new Error('Error al obtener carrito de la base de datos');
    }
  }

  /**
   * Agregar producto al carrito
   * @param {String} userId - ID del usuario
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async addToCart(userId, productId, quantity = 1) {
    try {
      let user = await User.findById(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si el usuario no tiene carrito, crear uno
      if (!user.cart) {
        console.log('📦 Creando nuevo carrito...');
        const newCart = await this.createCart();
        user.cart = newCart._id;
        await user.save();
      }

      // Obtener el carrito
      let cart = await Cart.findById(user.cart);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Buscar si el producto ya está en el carrito
      const existingProduct = cart.products.find(p =>
        p.product.toString() === productId
      );

      if (existingProduct) {
        // Si existe, incrementar cantidad
        existingProduct.quantity += quantity;
      } else {
        // Si no existe, agregar nuevo
        cart.products.push({
          product: productId,
          quantity
        });
      }

      return await cart.save();
    } catch (error) {
      console.error('❌ Error en DAO - addToCart:', error);
      throw new Error(error.message || 'Error al agregar producto al carrito');
    }
  }

  /**
   * Actualizar cantidad de un producto en el carrito
   * @param {String} userId - ID del usuario
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Nueva cantidad
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async updateCartQuantity(userId, productId, quantity) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.cart) {
        throw new Error('Usuario o carrito no encontrado');
      }

      const cart = await Cart.findById(user.cart);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const product = cart.products.find(p => p.product.toString() === productId);

      if (!product) {
        throw new Error('Producto no encontrado en el carrito');
      }

      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el producto
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
      } else {
        product.quantity = quantity;
      }

      return await cart.save();
    } catch (error) {
      console.error('❌ Error en DAO - updateCartQuantity:', error);
      throw new Error(error.message || 'Error al actualizar cantidad en carrito');
    }
  }

  /**
   * Eliminar un producto del carrito
   * @param {String} userId - ID del usuario
   * @param {String} productId - ID del producto
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async removeFromCart(userId, productId) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.cart) {
        throw new Error('Usuario o carrito no encontrado');
      }

      const cart = await Cart.findById(user.cart);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = cart.products.filter(p => p.product.toString() !== productId);

      return await cart.save();
    } catch (error) {
      console.error('❌ Error en DAO - removeFromCart:', error);
      throw new Error(error.message || 'Error al eliminar producto del carrito');
    }
  }

  /**
   * Vaciar el carrito
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object>} - Carrito vaciado
   */
  static async clearCart(userId) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.cart) {
        throw new Error('Usuario o carrito no encontrado');
      }

      const cart = await Cart.findById(user.cart);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      cart.products = [];

      return await cart.save();
    } catch (error) {
      console.error('❌ Error en DAO - clearCart:', error);
      throw new Error(error.message || 'Error al vaciar carrito');
    }
  }
}

export default CartDAO;
