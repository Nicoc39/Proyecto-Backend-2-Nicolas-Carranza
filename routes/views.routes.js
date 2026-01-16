import { Router } from 'express';

const router = Router();

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Middleware para verificar que NO esté autenticado
const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  res.redirect('/products');
};

// Ruta principal - redirige según estado de sesión
router.get('/', (req, res) => {
  if (req.session.user) {
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

// Vista de productos (protegida)
router.get('/products', isAuthenticated, (req, res) => {
  res.render('products', {
    title: 'Productos',
    user: req.session.user
  });
});

export default router;