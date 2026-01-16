import { Router } from 'express';

const router = Router();

// Datos de ejemplo de productos
const products = [
  { id: 1, name: 'Laptop Dell', price: 850, stock: 10 },
  { id: 2, name: 'Mouse Logitech', price: 25, stock: 50 },
  { id: 3, name: 'Teclado Mecánico', price: 75, stock: 30 },
  { id: 4, name: 'Monitor LG 24"', price: 200, stock: 15 },
  { id: 5, name: 'Webcam HD', price: 45, stock: 25 }
];

// Obtener todos los productos
router.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    products 
  });
});

// Obtener producto por ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
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
});

export default router;