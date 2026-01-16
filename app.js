import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';

// Rutas
import viewsRouter from './routes/views.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import productsRouter from './routes/products.routes.js';

// Passport config
import './config/passport.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;

// Conexión a MongoDB
const MONGO_URI = 'mongodb://localhost:27017/ecommerce';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Configuración de sesiones (DEBE IR ANTES DE PASSPORT)
app.use(session({
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 3600
  }),
  secret: 'coderSecret2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 // 1 hora
  }
}));

// Inicializar Passport (DESPUÉS DE SESSION)
app.use(passport.initialize());
app.use(passport.session());

// Middleware para pasar datos de sesión a las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// Rutas
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});