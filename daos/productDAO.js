import Product from '../models/product.js';

/**
 * ProductDAO - Data Access Object para productos
 * Responsabilidad: Acceso a base de datos para operaciones con productos
 */

class ProductDAO {
  /**
   * Obtener todos los productos
   * @returns {Promise<Array>} - Lista de productos
   */
  static async getAllProducts() {
    try {
      return await Product.find().select('_id name author description price stock category thumbnail');
    } catch (error) {
      console.error('❌ Error en DAO - getAllProducts:', error);
      throw new Error('Error al obtener productos de la base de datos');
    }
  }

  /**
   * Obtener un producto por ID
   * @param {String} productId - ID del producto
   * @returns {Promise<Object>} - Producto encontrado
   */
  static async getProductById(productId) {
    try {
      return await Product.findById(productId);
    } catch (error) {
      console.error('❌ Error en DAO - getProductById:', error);
      throw new Error('Error al obtener el producto de la base de datos');
    }
  }

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} - Producto creado
   */
  static async createProduct(productData) {
    try {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } catch (error) {
      console.error('❌ Error en DAO - createProduct:', error);
      throw new Error('Error al crear producto en la base de datos');
    }
  }

  /**
   * Actualizar un producto
   * @param {String} productId - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Producto actualizado
   */
  static async updateProduct(productId, updateData) {
    try {
      return await Product.findByIdAndUpdate(productId, updateData, { new: true });
    } catch (error) {
      console.error('❌ Error en DAO - updateProduct:', error);
      throw new Error('Error al actualizar producto en la base de datos');
    }
  }

  /**
   * Actualizar stock de un producto
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad a descontar
   * @returns {Promise<Object>} - Producto actualizado
   */
  static async updateStock(productId, quantity) {
    try {
      return await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -quantity } },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Error en DAO - updateStock:', error);
      throw new Error('Error al actualizar stock del producto');
    }
  }

  /**
   * Eliminar un producto
   * @param {String} productId - ID del producto
   * @returns {Promise<Object>} - Resultado de eliminación
   */
  static async deleteProduct(productId) {
    try {
      return await Product.findByIdAndDelete(productId);
    } catch (error) {
      console.error('❌ Error en DAO - deleteProduct:', error);
      throw new Error('Error al eliminar producto de la base de datos');
    }
  }

  /**
   * Contar cantidad de productos
   * @returns {Promise<Number>} - Cantidad de productos
   */
  static async countProducts() {
    try {
      return await Product.countDocuments();
    } catch (error) {
      console.error('❌ Error en DAO - countProducts:', error);
      throw new Error('Error al contar productos');
    }
  }

  /**
   * Insertar múltiples productos
   * @param {Array} products - Array de productos
   * @returns {Promise<Array>} - Productos insertados
   */
  static async insertMany(products) {
    try {
      return await Product.insertMany(products);
    } catch (error) {
      console.error('❌ Error en DAO - insertMany:', error);
      throw new Error('Error al insertar productos en la base de datos');
    }
  }
}

export default ProductDAO;
