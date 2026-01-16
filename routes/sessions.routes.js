import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Registro de usuario con Passport
router.post('/register', 
  passport.authenticate('register', { 
    failureRedirect: '/register',
    session: false 
  }),
  async (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'Usuario registrado exitosamente' 
    });
  }
);

// Login de usuario con Passport
router.post('/login',
  passport.authenticate('login', { 
    failureRedirect: '/login',
    session: true 
  }),
  async (req, res) => {
    // Guardar datos en sesión
    req.session.user = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role
    };

    res.json({ 
      status: 'success', 
      message: 'Login exitoso',
      redirect: '/products'
    });
  }
);

// Autenticación con GitHub - Redirige a GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// Callback de GitHub
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Guardar datos en sesión
    req.session.user = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role
    };

    // Redirigir a productos
    res.redirect('/products');
  }
);

// Logout
router.post('/logout', (req, res) => {
  console.log('Logout solicitado, sesión actual:', req.session.user);
  req.session.destroy(err => {
    if (err) {
      console.error('Error al destruir sesión:', err);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error al cerrar sesión' 
      });
    }
    console.log('Sesión destruida exitosamente');
    res.clearCookie('connect.sid');
    res.json({ 
      status: 'success', 
      message: 'Sesión cerrada exitosamente',
      redirect: '/login'
    });
  });
});

// Obtener usuario actual
router.get('/current', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'No hay sesión activa' 
    });
  }
  
  res.json({ 
    status: 'success', 
    user: req.session.user 
  });
});

export default router;