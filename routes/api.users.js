import { Router } from 'express';
import User from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/hashUtils.js';
import { generateToken, verifyToken } from '../utils/jwtUtils.js';

const router = Router();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  const token = req.signedCookies.currentUser;
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'No autorizado' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      status: 'error', 
      message: 'Token inválido' 
    });
  }
};

// CRUD: Obtener todos los usuarios
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ 
      status: 'success', 
      users 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener usuarios' 
    });
  }
});

// CRUD: Obtener usuario por ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      status: 'success', 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener usuario' 
    });
  }
});

// CRUD: Crear usuario
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role = 'user' } = req.body;

    // Validaciones
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Faltan campos requeridos' 
      });
    }

    // Verificar si existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El usuario ya existe' 
      });
    }

    // Crear usuario
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: createHash(password),
      role
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Usuario creado',
      user: {
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al crear usuario' 
    });
  }
});

// CRUD: Actualizar usuario
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;

    // Solo admin o el usuario mismo puede actualizar
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'No autorizado' 
      });
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;
    if (role && req.user.role === 'admin') updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ 
      status: 'success', 
      message: 'Usuario actualizado',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al actualizar usuario' 
    });
  }
});

// CRUD: Eliminar usuario
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Solo admin o el usuario mismo puede eliminar
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'No autorizado' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      status: 'success', 
      message: 'Usuario eliminado'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al eliminar usuario' 
    });
  }
});

// LOGIN: Validar email y contraseña, generar JWT en cookie
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intento de login:', { email });

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email y contraseña requeridos' 
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    
    console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Login failed!' 
      });
    }

    // Validar contraseña
    const passwordValid = isValidPassword(password, user.password);
    console.log('🔑 Contraseña válida:', passwordValid);
    
    if (!passwordValid) {
      console.log('❌ Contraseña inválida para:', email);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Login failed!' 
      });
    }

    // Generar JWT
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    console.log('✓ Token generado:', token.substring(0, 20) + '...');

    // Guardar JWT en cookie firmada
    res.cookie('currentUser', token, {
      signed: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true,
      secure: false // true en producción con HTTPS
    });

    console.log('✓ Login exitoso para:', email);

    res.json({ 
      status: 'success', 
      message: 'Login exitoso',
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      },
      redirect: '/products'
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al iniciar sesión' 
    });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('currentUser');
  res.json({ 
    status: 'success', 
    message: 'Logout exitoso',
    redirect: '/users/login'
  });
});

// Obtener usuario actual
router.get('/current/info', (req, res) => {
  const token = req.signedCookies.currentUser;
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'No autorizado' 
    });
  }

  try {
    const decoded = verifyToken(token);
    res.json({ 
      status: 'success', 
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      status: 'error', 
      message: 'Token inválido' 
    });
  }
});

export default router;
