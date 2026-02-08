# 🛒 Backend E-Commerce

Proyecto de Backend con Express.js + MongoDB para la plataforma de CoderHouse, el mismo simula un e-commerce orientado a la venta de libros. Incluye JWT, roles, compras con tickets, recuperación de contraseña y envío de email. 

Nota: Las imagenes de portadas se obtuvieron desde Open Library Covers API.

## 🔧 Instalación

### Requisitos Previos
- Node.js v14+ 
- MongoDB (local o Atlas)
- Cuenta SMTP (Mailtrap, Gmail, etc.)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
cd "Proyecto Backend 2 Nicolas Carranza"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Crear archivo .env**
```bash
cp .env.example .env
```

4. **Configurar variables de entorno**
```env
# Puerto del servidor
PORT=8080

# MongoDB
MONGO_URI=mongodb+srv://usuario:contrasena@cluster.mongodb.net/Database?retryWrites=true&w=majority

# Sesion
SESSION_SECRET=tu_session_secret

# JWT
JWT_SECRET=tu_jwt_secret
JWT_EXPIRATION=24h

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario
SMTP_PASS=tu_password
SMTP_FROM=noreply@ecommerce.com

# Frontend URL
FRONTEND_URL=http://localhost:8080

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:8080/api/sessions/github/callback

# Node Environment
NODE_ENV=development

# Logging
LOG_LEVEL=debug
```

5. **Iniciar servidor**
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

## 📁 Estructura (resumen)

```
Proyecto-Backend-2-Nicolas-Carranza/
├── config/
│   └── passport.config.js      # Configuración de Passport
├── middlewares/
│   └── auth.middleware.js      # Middleware de autenticación JWT
├── models/
│   ├── User.js                 # Modelo de usuario
│   ├── Cart.js                 # Modelo de carrito
│   └── Product.js              # Modelo de producto
├── routes/
│   ├── sessions.routes.js      # Auth
│   ├── views.routes.js         # Vistas
│   ├── products.routes.js      # Productos
│   ├── cart.routes.js          # Carrito
│   └── purchases.routes.js     # Compras/tickets
├── controllers/
│   ├── sessionController.js    # Auth
│   ├── productController.js    # CRUD productos
│   ├── cartController.js       # Carrito
│   └── purchaseController.js   # Compras/tickets
├── services/
│   ├── purchaseService.js      # Compras
│   ├── authorizationService.js # Permisos
│   └── emailService.js         # Emails
├── daos/
│   ├── productDAO.js
│   ├── cartDAO.js
│   └── ticketDAO.js
├── repositories/
│   ├── baseRepository.js
│   ├── userRepository.js
│   └── productRepository.js
├── utils/
│   ├── hashUtils.js            # Bcrypt
│   └── jwtUtils.js             # JWT
├── views/
│   ├── layouts/
│   │   └── main.handlebars     # Layout principal
│   ├── login.handlebars        # Login
│   ├── register.handlebars     # Registro
│   ├── products.handlebars     # Productos
│   ├── cart.handlebars         # Carrito
│   ├── current.handlebars      # Perfil/historial
│   └── admin-products.handlebars # Admin productos
├── public/
│   └── css/
│       └── styles.css          # Estilos
├── .env.example                # Ejemplo de variables de entorno
├── .gitignore                  # Archivos ignorados
├── app.js                      # Servidor principal
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

## ✅ Pruebas

- Colección Postman en `postman_collection.json`
- Importar en Postman y usar variables `baseUrl`, `userToken`, `adminToken`
passport.use('jwt', ...)
```
- Valida tokens JWT
- Extrae usuario de la base de datos
- Utilizado en ruta `/current`

## 🛣️ Rutas de API

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/sessions/register` | Registro con JWT | No |
| POST | `/api/sessions/login` | Login con JWT | No |
| GET | `/api/sessions/github` | Iniciar OAuth GitHub | No |
| GET | `/api/sessions/github/callback` | Callback de GitHub | No |
| **GET** | **`/api/sessions/current`** | **Obtener usuario actual (JWT)** | **Sí** |
| POST | `/api/sessions/logout` | Cerrar sesión | No |

### Productos

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/products` | Listar productos | No |
| GET | `/api/products/:id` | Obtener producto | No |

### Vistas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Redirección inteligente |
| GET | `/login` | Página de login |
| GET | `/register` | Página de registro |
| GET | `/products` | Catálogo (protegido) |

## 🔒 Sistema de Roles

### Usuario Administrador
- **Email:** `adminCoder@coder.com`
- **Contraseña:** La que definas
- **Rol:** `admin` (automático)
- **Indicador:** 👑 Administrador

### Usuario Regular
- **Email:** Cualquier otro
- **Rol:** `user` (default)
- **Indicador:** 👤 Usuario

## 🔐 Seguridad

### Hash de Contraseñas
```javascript
// utils/hashUtils.js
import bcrypt from 'bcrypt';

export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};
```

### JWT
```javascript
// utils/jwtUtils.js
import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
```

### Características de Seguridad
- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ Tokens JWT con expiración de 24h
- ✅ Sesiones almacenadas en MongoDB
- ✅ Middleware de autenticación
- ✅ Middleware de autorización (admin)
- ✅ OAuth 2.0 con GitHub

## 💡 Middleware de Autenticación

```javascript
// middlewares/auth.middleware.js
export const authMiddleware = async (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).populate('cart');
  req.user = user;
  next();
};
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Passport.js** - Autenticación
  - passport-local
  - passport-github2
  - passport-jwt
- **JWT** - JSON Web Tokens

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Seguridad
- **bcrypt** - Hashing con `hashSync()` y `compareSync()`
- **jsonwebtoken** - Generación y verificación de JWT
- **express-session** - Gestión de sesiones
- **connect-mongo** - Store de sesiones
- **cookie-parser** - Manejo de cookies

### Frontend
- **Handlebars** - Motor de templates
- **CSS3** - Estilos modernos
- **LocalStorage** - Almacenamiento de JWT

## 🐛 Troubleshooting

### Token inválido o expirado
- Verificar que el token esté en el formato correcto
- Tokens expiran en 24h, hacer login nuevamente
- Verificar que `JWT_SECRET` sea el mismo en toda la app

### Usuario no encontrado en /current
- Asegurarse de enviar el header `Authorization: Bearer {token}`
- Verificar que el token sea válido
- Usuario debe existir en la base de datos

### MongoDB no conecta
```bash
mongod --version
mongod
```

### GitHub OAuth no funciona
- Verificar URLs exactas en la configuración
- CLIENT_ID y CLIENT_SECRET correctos
- Callback: `http://localhost:8080/api/sessions/github/callback`

## 📧 Contacto

- Nicolás Carranza
- Nicoc39@gmail.com
- comision coderhouse: 76905

## 📄 Licencia

ISC