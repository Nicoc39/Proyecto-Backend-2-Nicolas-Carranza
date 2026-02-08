import dotenv from 'dotenv';
import { z } from 'zod';

// Cargar variables de entorno
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRATION: z.string().min(1).default('24h'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('debug')
});

const env = envSchema.parse(process.env);

// Configuracion centralizada del proyecto
const config = {
  // Servidor
  port: env.PORT,
  nodeEnv: env.NODE_ENV,

  // MongoDB
  mongoUri: env.MONGO_URI,

  // Sesion
  sessionSecret: env.SESSION_SECRET,
  sessionTTL: 3600, // 1 hora en segundos
  cookieMaxAge: 3600000, // 1 hora en milisegundos

  // JWT
  jwtSecret: env.JWT_SECRET,
  jwtExpiration: env.JWT_EXPIRATION,

  // SMTP
  smtp: {
    host: env.SMTP_HOST || 'smtp.mailtrap.io',
    port: env.SMTP_PORT || 2525,
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
    from: env.SMTP_FROM || 'noreply@ecommerce.com'
  },

  // Frontend
  frontendUrl: env.FRONTEND_URL || 'http://localhost:8080',

  // GitHub OAuth
  github: {
    clientId: env.GITHUB_CLIENT_ID || '',
    clientSecret: env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/sessions/github/callback'
  },

  // Logging
  logLevel: env.LOG_LEVEL,

  // Otros
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production'
};

export default config;
