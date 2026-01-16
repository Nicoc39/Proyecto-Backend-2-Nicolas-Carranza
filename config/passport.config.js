import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user_model.js';
import { createHash, isValidPassword } from '../utils/hashUtils.js';

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

      // Determinar rol
      let role = 'usuario';
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
      const user = await User.findOne({ email });
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

      let user = await User.findOne({ email });

      if (!user) {
        // Crear nuevo usuario desde GitHub
        user = await User.create({
          first_name: profile.displayName || profile.username,
          last_name: '',
          email,
          age: 0,
          password: '', // No tiene contraseña local
          role: 'usuario',
          githubId: profile.id
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialización del usuario
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialización del usuario
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;