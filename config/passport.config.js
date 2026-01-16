import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';
import Cart from '../models/cart.js';
import { createHash, isValidPassword } from '../utils/hashUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretJWT2024';

// Estrategia Local para Registro
passport.use('register', new LocalStrategy(
  {
    passReqToCallback: true,
    usernameField: 'email'
  },
  async (req, email, password, done) => {
    try {
      const { first_name, last_name, age } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return done(null, false, { message: 'El usuario ya existe' });
      }

      // Crear carrito para el nuevo usuario
      const newCart = await Cart.create({ products: [] });

      // Determinar rol
      let role = 'user';
      if (email === 'adminCoder@coder.com') {
        role = 'admin';
      }

      // Crear usuario con contraseña hasheada
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        age,
        password: createHash(password),
        cart: newCart._id,
        role
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia Local para Login
passport.use('login', new LocalStrategy(
  {
    usernameField: 'email'
  },
  async (email, password, done) => {
    try {
      // Buscar usuario
      const user = await User.findOne({ email }).populate('cart');
      if (!user) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      if (!isValidPassword(password, user.password)) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia de GitHub
passport.use('github', new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID || 'tu_github_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'tu_github_client_secret',
    callbackURL: 'http://localhost:8080/api/sessions/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por email de GitHub
      const email = profile.emails && profile.emails[0] 
        ? profile.emails[0].value 
        : `${profile.username}@github.com`;

      let user = await User.findOne({ email }).populate('cart');

      if (!user) {
        // Crear carrito para el nuevo usuario
        const newCart = await Cart.create({ products: [] });

        // Crear nuevo usuario desde GitHub
        user = await User.create({
          first_name: profile.displayName || profile.username,
          last_name: '',
          email,
          age: 0,
          password: '', // No tiene contraseña local
          cart: newCart._id,
          role: 'user',
          githubId: profile.id
        });

        // Populate cart
        user = await User.findById(user._id).populate('cart');
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia JWT
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate('cart');
      
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Estrategia "Current" - Valida usuario logueado mediante JWT
passport.use('current', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (jwt_payload, done) => {
    try {
      // Buscar usuario por ID del payload
      const user = await User.findById(jwt_payload.id).populate('cart');
      
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // Retornar usuario validado
      return done(null, user);
    } catch (error) {
      return done(error, false, { message: 'Error al validar token' });
    }
  }
));

// Serialización del usuario (para sesiones)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialización del usuario (para sesiones)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).populate('cart');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;