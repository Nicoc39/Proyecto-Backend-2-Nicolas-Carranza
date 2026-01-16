import { Router } from 'express';
import Product from '../models/product.js';

const router = Router();

// Datos de ejemplo de productos
const sampleProducts = [
  { name: 'Laptop Dell', price: 850, stock: 10, category: 'Electrónica', description: 'Laptop potente' },
  { name: 'Mouse Logitech', price: 25, stock: 50, category: 'Accesorios', description: 'Mouse inalámbrico' },
  { name: 'Teclado Mecánico', price: 75, stock: 30, category: 'Accesorios', description: 'Teclado RGB' },
  { name: 'Monitor LG 24"', price: 200, stock: 15, category: 'Pantallas', description: 'Monitor Full HD' },
  { name: 'Webcam HD', price: 45, stock: 25, category: 'Accesorios', description: 'Webcam 1080p' }
];

// Inicializar productos en la BD si no existen
async function initializeProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log('✓ Productos inicializados en la BD');
    }
  } catch (error) {
    console.error('Error inicializando productos:', error);
  }
}

initializeProducts();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('_id name price stock');
    res.json({ 
      status: 'success', 
      products 
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener productos'
    });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
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
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener producto'
    });
  }
});

export default router;