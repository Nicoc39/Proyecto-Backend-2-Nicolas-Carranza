import express from 'express';
import session from 'express-session';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';

// Importar configuración centralizada
import config from './config/config.js';
import logger from './utils/logger.js';

// Rutas
import viewsRouter from './routes/views.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/cart.routes.js';
import purchasesRouter from './routes/purchases.routes.js';

// Passport config
import './config/passport.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Conexión a MongoDB
mongoose.connect(config.mongoUri)
  .then(() => logger.info('Conectado a MongoDB'))
  .catch(err => logger.error({ err }, 'Error conectando a MongoDB'));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use(cookieParser());

// Configuración de sesiones (DEBE IR ANTES DE PASSPORT)
const mongoStore = MongoStore.create({
  mongoUrl: config.mongoUri,
  ttl: config.sessionTTL
});

app.use(session({
  store: mongoStore,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.cookieMaxAge
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
app.use('/api/carts', cartsRouter);
app.use('/api/purchases', purchasesRouter);

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Servidor escuchando');
  logger.info({ url: `http://localhost:${config.port}` }, 'URL local');
  logger.info({ env: config.nodeEnv }, 'Entorno');
});