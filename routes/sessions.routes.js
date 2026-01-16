import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwtUtils.js';

const router = Router();

// Registro de usuario con Passport
router.post('/register', 
  passport.authenticate('register', { 
    session: false,
    failureRedirect: '/register'
  }),
  async (req, res) => {
    // Generar JWT
    const token = generateToken({
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });

    res.json({ 
      status: 'success', 
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role,
        cart: req.user.cart
      }
    });
  }
);

// Login de usuario con Passport y JWT
router.post('/login',
  passport.authenticate('login', { 
    session: false,
    failureRedirect: '/login'
  }),
  async (req, res) => {
    try {
      // Generar JWT
      const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });

      console.log('✓ Token generado:', token.substring(0, 20) + '...');

      // También crear sesión para compatibilidad con vistas
      if (req.session) {
        req.session.user = {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        };
      }

      res.json({ 
        status: 'success', 
        message: 'Login exitoso',
        token,
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        },
        redirect: '/products'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al procesar login',
        error: error.message
      });
    }
  }
);

// Autenticación con GitHub - Redirige a GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// Callback de GitHub
router.get('/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Generar JWT
    const token = generateToken({
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });

    // Guardar datos en sesión para compatibilidad con vistas
    if (req.session) {
      req.session.user = {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role,
        cart: req.user.cart
      };
    }

    // Redirigir a productos con token en query (para guardarlo en localStorage)
    res.redirect(`/products?token=${token}`);
  }
);

// Ruta /current - Valida usuario con JWT usando estrategia "current" de Passport
router.get('/current', 
  passport.authenticate('current', { 
    session: false,
    failureRedirect: '/login'
  }),
  async (req, res) => {
    try {
      // El middleware passport.authenticate ya validó el token y agregó req.user
      res.json({
        status: 'success',
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener datos del usuario'
      });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  // Con JWT no hay mucho que hacer en el servidor
  // El cliente debe eliminar el token
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error al cerrar sesión' 
        });
      }
    });
  }
  
  res.json({ 
    status: 'success', 
    message: 'Sesión cerrada exitosamente',
    redirect: '/login'
  });
});

export default router;