# 🚀 Guía de Deployment

## Preparación para Producción

### Checklist Pre-Deployment

- [ ] Código revisado y testeado
- [ ] Variables de ambiente configuradas
- [ ] Base de datos MongoDB en Atlas
- [ ] SMTP configurado (Mailtrap/SendGrid/Gmail)
- [ ] Certificados SSL/TLS listos
- [ ] Backups de BD configurados
- [ ] Logs centralizados
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Monitoreo en lugar

---

## 1. Deployment en Heroku

### Prerequisitos
- Heroku CLI instalado: https://devcenter.heroku.com/articles/heroku-cli
- Cuenta en Heroku: https://www.heroku.com/

### Pasos

1. **Login en Heroku**
```bash
heroku login
```

2. **Crear aplicación**
```bash
heroku create tu-app-name
```

3. **Configurar variables de ambiente**
```bash
heroku config:set MONGODB_URI=tu_uri_mongodb_atlas
heroku config:set DB_NAME=ecommerce
heroku config:set JWT_SECRET=tu_secreto_super_seguro
heroku config:set JWT_EXPIRES_IN=24h
heroku config:set SMTP_HOST=smtp.mailtrap.io
heroku config:set SMTP_PORT=2525
heroku config:set SMTP_USER=tu_usuario
heroku config:set SMTP_PASS=tu_contraseña
heroku config:set SMTP_FROM=noreply@tuapp.com
heroku config:set FRONTEND_URL=https://tu-app-name.herokuapp.com
heroku config:set PORT=8080
```

4. **Verificar configuración**
```bash
heroku config
```

5. **Deploy**
```bash
git push heroku main
```

6. **Ver logs**
```bash
heroku logs --tail
```

7. **Abrir la app**
```bash
heroku open
```

---

## 2. Deployment en AWS

### Opción A: Elastic Beanstalk

1. **Instalar AWS CLI**
```bash
pip install awscli-local
```

2. **Crear archivo `.ebextensions/node.config`**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    GzipCompression: true
```

3. **Inicializar Elastic Beanstalk**
```bash
eb init -p "Node.js" tu-app-name
```

4. **Crear entorno**
```bash
eb create tu-env-name
```

5. **Configurar variables de ambiente**
```bash
eb setenv MONGODB_URI=tu_uri JWT_SECRET=tu_secreto ...
```

6. **Deploy**
```bash
eb deploy
```

### Opción B: EC2 + RDS

1. **Lanzar instancia EC2** (Ubuntu 20.04 LTS)
2. **SSH a la instancia**
```bash
ssh -i tu-key.pem ubuntu@tu-ip-publica
```

3. **Instalar dependencias**
```bash
sudo apt update
sudo apt install nodejs npm git
```

4. **Clonar repositorio**
```bash
git clone <repo-url>
cd proyecto
```

5. **Instalar paquetes**
```bash
npm install
```

6. **Crear .env**
```bash
nano .env
```

7. **Instalar PM2**
```bash
sudo npm install -g pm2
```

8. **Iniciar con PM2**
```bash
pm2 start app.js --name "ecommerce"
pm2 startup
pm2 save
```

9. **Configurar Nginx como proxy reverso**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

10. **Reiniciar Nginx**
```bash
sudo systemctl restart nginx
```

---

## 3. Deployment en Google Cloud Platform

### Cloud Run (Serverless)

1. **Instalar Google Cloud SDK**
2. **Authenticarse**
```bash
gcloud auth login
```

3. **Crear archivo `Dockerfile`**
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
```

4. **Build y deploy**
```bash
gcloud run deploy tu-app-name \
  --source . \
  --platform managed \
  --region us-central1
```

5. **Configurar variables de ambiente**
```bash
gcloud run services update tu-app-name \
  --update-env-vars \
  MONGODB_URI=tu_uri,JWT_SECRET=tu_secreto,...
```

---

## 4. Deployment en DigitalOcean

### App Platform

1. **Conectar repositorio GitHub**
   - Ir a DigitalOcean > App Platform
   - Seleccionar repositorio

2. **Configurar app**
   - Build command: `npm install`
   - Run command: `npm start`
   - Port: 8080

3. **Añadir variables de ambiente**
   - MONGODB_URI, JWT_SECRET, SMTP_*, etc.

4. **Deploy**
   - Click "Deploy"

---

## 5. Certificados SSL/TLS

### Let's Encrypt (Gratuito)

1. **Instalar Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtener certificado**
```bash
sudo certbot certonly --nginx -d tu-dominio.com
```

3. **Configurar auto-renovación**
```bash
sudo certbot renew --dry-run
```

4. **Usar en Node.js**
```javascript
import fs from 'fs';
import https from 'https';

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/tu-dominio/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tu-dominio/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## 6. Backups de Base de Datos

### MongoDB Atlas

1. **Ir a Dashboard**
2. **Atlas Backups**
3. **Configurar backup automático**
   - Frecuencia: Cada 6-12 horas
   - Retención: 30-90 días

### Backup Local

```bash
# Hacer backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" --out backup/

# Restaurar
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/" backup/
```

---

## 7. Monitoreo y Alertas

### Sentry (Error Tracking)

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// app.js
import Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### DataDog (Performance)

```bash
npm install dd-trace
```

```javascript
// Primero en app.js
import tracer from 'dd-trace';
tracer.init();
```

---

## 8. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests
});

// Aplicar a todas las rutas
app.use(limiter);

// O solo a login
app.post('/api/sessions/login', 
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5 // máximo 5 intentos
  }),
  SessionController.handleLogin
);
```

---

## 9. CORS Configurado

```javascript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tu-dominio.com',
    'https://www.tu-dominio.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 10. Variables de Ambiente por Ambiente

### .env.development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=dev-secret-123
SMTP_HOST=smtp.mailtrap.io
FRONTEND_URL=http://localhost:3000
DEBUG=true
```

### .env.production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@atlas.mongodb.net/
JWT_SECRET=produccion-secreto-muy-seguro
SMTP_HOST=smtp.sendgrid.net
FRONTEND_URL=https://tu-dominio.com
DEBUG=false
```

---

## 11. Health Check & Graceful Shutdown

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime() 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Cerrar conexiones
  mongoose.connection.close();
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});
```

---

## 12. Optimizaciones de Performance

### Compresión GZIP
```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

### Caché de Headers
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### Connection Pooling MongoDB
```javascript
// En mongoose.connect()
{
  maxPoolSize: 10,
  minPoolSize: 5
}
```

---

## 13. Checklist de Seguridad

- [ ] HTTPS/TLS activado
- [ ] CORS restringido a dominios conocidos
- [ ] Rate limiting activado
- [ ] Headers de seguridad (Helmet)
- [ ] CSRF protection
- [ ] Input validation en todas las rutas
- [ ] SQL injection prevention (usando ODM)
- [ ] XSS prevention
- [ ] Passwords hasheados
- [ ] Tokens expirados
- [ ] HTTPS Strict Transport Security (HSTS)
- [ ] Content Security Policy (CSP)

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## 14. Troubleshooting

### "Port already in use"
```bash
lsof -i :8080
kill -9 <PID>
```

### MongoDB Connection Timeout
- Verificar IP whitelist en MongoDB Atlas
- Verificar URI de conexión
- Aumentar timeout: `serverSelectionTimeoutMS: 10000`

### Email no funciona
- Verificar credenciales SMTP
- Verificar que no es blocked por firewall
- Revisar logs de Mailtrap/SendGrid

### Tokens expirados en producción
- Verificar sincronización de hora del servidor
- Usar NTP: `sudo ntpdate -s time.nist.gov`

---

## 15. Monitoreo Post-Deployment

### Métricas Importantes
- Uptime (99.9%+)
- Response time (<500ms)
- Error rate (<1%)
- Database connections
- Memory usage
- CPU usage

### Alertas Recomendadas
- Error rate > 5%
- Response time > 2s
- Memory > 80%
- Database connection pool agotado
- SMTP falla

---

## Recursos Adicionales

- Heroku: https://devcenter.heroku.com/
- AWS: https://docs.aws.amazon.com/
- Google Cloud: https://cloud.google.com/docs
- DigitalOcean: https://docs.digitalocean.com/
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Let's Encrypt: https://letsencrypt.org/

---

**Última actualización:** 2024  
**Estado:** Guía completa de deployment
