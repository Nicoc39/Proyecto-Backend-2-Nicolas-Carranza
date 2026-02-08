import ProductDAO from '../daos/productDAO.js';

/**
 * ProductController - Controlador para productos
 * Responsabilidad: Manejar lógica de solicitudes/respuestas para productos
 */

// Datos de ejemplo de productos - Librería NUBE NEGRA
const sampleProducts = [
  { 
    name: 'Damian', 
    author: 'Desconocido',
    description: 'Novela de suspenso e intriga que te mantendrá en vilo', 
    price: 18.99, 
    stock: 20, 
    category: 'Ficción',
    thumbnail: 'https://covers.openlibrary.org/b/id/12861557-L.jpg'
  }
];

class ProductController {
  /**
   * Inicializar productos en la BD si no existen
   */
  static async initializeProducts() {
    try {
      const count = await ProductDAO.countProducts();
      if (count === 0) {
        await ProductDAO.insertMany(sampleProducts);
        console.log('✓ Productos inicializados en la BD');
      }
    } catch (error) {
      console.error('Error inicializando productos:', error);
    }
  }

  /**
   * Obtener todos los productos
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getAllProducts(req, res) {
    try {
      console.log('📦 Obteniendo todos los productos...');
      const products = await ProductDAO.getAllProducts();
      
      res.json({
        status: 'success',
        products
      });
    } catch (error) {
      console.error('❌ Error en controlador - getAllProducts:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener productos'
      });
    }
  }

  /**
   * Obtener un producto por ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async getProductById(req, res) {
    try {
      console.log(`📦 Obteniendo producto con ID: ${req.params.id}`);
      
      const product = await ProductDAO.getProductById(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }

      res.json({
        status: 'success',
        product
      });
    } catch (error) {
      console.error('❌ Error en controlador - getProductById:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener producto'
      });
    }
  }

  /**
   * Crear un nuevo producto (solo para admins)
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async createProduct(req, res) {
    try {
      console.log('📦 Creando nuevo producto...');

      // Validar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permisos para crear productos'
        });
      }

      const newProduct = await ProductDAO.createProduct(req.body);

      res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        product: newProduct
      });
    } catch (error) {
      console.error('❌ Error en controlador - createProduct:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al crear producto'
      });
    }
  }

  /**
   * Actualizar un producto (solo para admins)
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async updateProduct(req, res) {
    try {
      console.log(`📦 Actualizando producto con ID: ${req.params.id}`);

      // Validar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permisos para actualizar productos'
        });
      }

      const updatedProduct = await ProductDAO.updateProduct(req.params.id, req.body);

      if (!updatedProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }

      res.json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        product: updatedProduct
      });
    } catch (error) {
      console.error('❌ Error en controlador - updateProduct:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al actualizar producto'
      });
    }
  }

  /**
   * Eliminar un producto (solo para admins)
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  static async deleteProduct(req, res) {
    try {
      console.log(`📦 Eliminando producto con ID: ${req.params.id}`);

      // Validar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permisos para eliminar productos'
        });
      }

      const deletedProduct = await ProductDAO.deleteProduct(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }

      res.json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        product: deletedProduct
      });
    } catch (error) {
      console.error('❌ Error en controlador - deleteProduct:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al eliminar producto'
      });
    }
  }
}

export default ProductController;
