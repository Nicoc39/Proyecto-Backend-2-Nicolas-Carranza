import { Router } from 'express';
import { verifyToken } from '../utils/jwtUtils.js';

const router = Router();

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  const token = req.signedCookies.currentUser;
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      res.clearCookie('currentUser');
    }
  }
  res.redirect('/login');
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

// Vista de login - ruta raíz
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión'
  });
});

// Vista de usuario actual
router.get('/current', isAuthenticated, (req, res) => {
  res.render('current', {
    title: 'Usuario Actual',
    user: req.user
  });
});

export default router;
