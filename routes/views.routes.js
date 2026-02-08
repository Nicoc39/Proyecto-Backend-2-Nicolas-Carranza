import { Router } from 'express';

const router = Router();

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  // Verificar si hay sesión (para compatibilidad)
  if (req.session && req.session.user) {
    return next();
  }
  
  // Si no hay sesión, redirigir a login
  // El frontend manejará la autenticación con JWT
  res.redirect('/login');
};

// Middleware para verificar que NO esté autenticado
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/products');
  }
  next();
};

// Ruta principal - redirige según estado de sesión
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/products');
  }
  res.redirect('/login');
});

// Vista de login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión'
  });
});

// Vista de registro
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', {
    title: 'Registro de Usuario'
  });
});

// Vista de usuario actual
router.get('/current', (req, res) => {
  res.render('current', {
    title: 'Usuario Actual',
    user: req.session?.user || null
  });
});

// Vista para solicitar recuperacion de contrasena
router.get('/request-password-reset', isNotAuthenticated, (req, res) => {
  res.render('request-password-reset', {
    title: 'Recuperar Contrasena'
  });
});

// Vista de restablecer contraseña
router.get('/reset-password', isNotAuthenticated, (req, res) => {
  res.render('reset-password', {
    title: 'Restablecer Contraseña'
  });
});

// Vista de productos - MODIFICADA para JWT
router.get('/products', (req, res) => {
  // Si hay sesión de servidor, usar esos datos
  if (req.session && req.session.user) {
    return res.render('products', {
      title: 'Productos',
      user: req.session.user
    });
  }
  
  // Si no hay sesión, renderizar la vista de todos modos
  // El frontend verificará el JWT y obtendrá los datos del usuario
  res.render('products', {
    title: 'Productos',
    user: null // El frontend cargará los datos con JWT
  });
});

// Vista de admin de productos
router.get('/admin/products', (req, res) => {
  res.render('admin-products', {
    title: 'Admin Productos'
  });
});

// Vista de debug - NUEVA
router.get('/debug', (req, res) => {
  res.render('debug', {
    title: 'Debug JWT'
  });
});

// Vista del carrito
router.get('/cart', (req, res) => {
  res.render('cart', {
    title: 'Carrito de Compras'
  });
});

export default router;