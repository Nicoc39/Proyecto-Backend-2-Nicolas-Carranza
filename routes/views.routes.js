import { Router } from 'express';
import { verifyToken } from '../utils/jwtUtils.js';

const router = Router();

// Middleware para verificar autenticación (cookie)
const isAuthenticated = (req, res, next) => {
  const token = req.signedCookies.currentUser;
  
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    res.clearCookie('currentUser');
    res.redirect('/login');
  }
};

// Middleware para verificar que NO esté autenticado
const isNotAuthenticated = (req, res, next) => {
  const token = req.signedCookies.currentUser;
  
  if (token) {
    try {
      verifyToken(token);
      return res.redirect('/products');
    } catch (error) {
      res.clearCookie('currentUser');
    }
  }
  next();
};

// Ruta principal - redirige según estado de sesión
router.get('/', (req, res) => {
  const token = req.signedCookies.currentUser;
  
  if (token) {
    try {
      verifyToken(token);
      return res.redirect('/products');
    } catch (error) {
      res.clearCookie('currentUser');
    }
  }
  res.redirect('/login');
});

// Vista de login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión'
  });
});

// Vista de productos (protegida)
router.get('/products', isAuthenticated, (req, res) => {
  res.render('products', {
    title: 'Productos',
    user: req.user
  });
});

// Vista de carrito (protegida)
router.get('/cart', isAuthenticated, (req, res) => {
  res.render('cart', {
    title: 'Mi Carrito',
    user: req.user
  });
});

export default router;