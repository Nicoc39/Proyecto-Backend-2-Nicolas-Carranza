import { Router } from 'express';
import passport from 'passport';
import SessionController from '../controllers/sessionController.js';

const router = Router();

// Registro de usuario con Passport
router.post('/register', (req, res, next) => {
  passport.authenticate('register', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error en registro'
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: info?.message || 'Registro inválido'
      });
    }

    req.user = user;
    return SessionController.handleRegister(req, res);
  })(req, res, next);
});

// Login de usuario con Passport y JWT
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error en login'
      });
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: info?.message || 'Credenciales inválidas'
      });
    }

    req.user = user;
    return SessionController.handleLogin(req, res);
  })(req, res, next);
});

// Solicitar recuperación de contraseña
router.post('/request-password-reset', SessionController.requestPasswordReset);

// Restablecer contraseña
router.post('/reset-password', SessionController.resetPassword);

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
  SessionController.handleGithubCallback
);

// Ruta /current - Valida usuario con JWT usando estrategia "current" de Passport
router.get('/current', 
  passport.authenticate('current', { 
    session: false,
    failureRedirect: '/login'
  }),
  SessionController.handleGetCurrent
);

// Logout
router.post('/logout', SessionController.handleLogout);

export default router;