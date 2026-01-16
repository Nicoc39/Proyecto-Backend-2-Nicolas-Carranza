# Sistema de Login con JWT, Passport y GitHub OAuth - E-Commerce

Sistema completo de autenticación con JWT (JSON Web Tokens), Passport.js, gestión de sesiones, roles de usuario, carritos de compra y autenticación con GitHub OAuth.

## 🚀 Características Principales

- ✅ **Sistema de autenticación con JWT**
- ✅ **Registro de usuarios** con validación y Passport Local Strategy
- ✅ **Login seguro** con bcrypt (contraseñas hasheadas con `hashSync`)
- ✅ **Autenticación con GitHub** OAuth 2.0
- ✅ **Sistema de roles** (User/Admin)
- ✅ **Modelo de Usuario completo** con referencia a Cart
- ✅ **Gestión de carritos** para cada usuario
- ✅ **Ruta `/current`** para validar usuario con JWT
- ✅ **Protección de rutas** con middlewares
- ✅ **Interfaz responsive** con Handlebars
- ✅ **Catálogo de productos**

## 📋 Requisitos del Proyecto

### 1. ✅ Modelo de Usuario
```javascript
{
  first_name: String,
  last_name: String,
  email: String (único),
  age: Number,
  password: String (hasheado),
  cart: ObjectId (referencia a Carts),
  role: String (default: 'user')
}
```

### 2. ✅ Encriptación con bcrypt
- Contraseñas hasheadas usando `bcrypt.hashSync()`
- Verificación con `bcrypt.compareSync()`

### 3. ✅ Estrategias de Passport
- **Local Strategy (Register)**: Registro de nuevos usuarios
- **Local Strategy (Login)**: Autenticación de usuarios
- **GitHub Strategy**: OAuth con GitHub
- **JWT Strategy**: Validación de tokens JWT

### 4. ✅ Sistema de Login con JWT
- Generación de tokens JWT al login/registro
- Tokens almacenados en localStorage (cliente)
- Expiración de 24 horas

### 5. ✅ Ruta `/current`
```
GET /api/sessions/current
Authorization: Bearer {token}
```
Retorna los datos del usuario autenticado mediante JWT.

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Nicoc39/Proyecto-Backend-2-Nicolas-Carranza.git
cd Proyecto-Backend-2-Nicolas-Carranza
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
SESSION_SECRET=coderSecret2024
JWT_SECRET=coderSecretJWT2024
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
PORT=8080
```

### 4. Configurar GitHub OAuth (Opcional)

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Click en "New OAuth App"
3. Completa los datos:
   - **Application name:** Tu nombre de app
   - **Homepage URL:** `http://localhost:8080`
   - **Authorization callback URL:** `http://localhost:8080/api/sessions/github/callback`
4. Copia el **Client ID** y **Client Secret**
5. Pégalos en tu archivo `.env`

### 5. Iniciar MongoDB
```bash
# En Windows
mongod

# En Linux/Mac
sudo systemctl start mongod
```

### 6. Iniciar el servidor
```bash
npm start
# O para desarrollo con nodemon
npm run dev
```

### 7. Abrir en el navegador
```
http://localhost:8080
```

## 📁 Estructura del Proyecto

```
Proyecto-Backend-2-Nicolas-Carranza/
├── config/
│   └── passport.config.js      # Configuración de Passport (4 strategies)
├── middlewares/
│   └── auth.middleware.js      # Middleware de autenticación JWT
├── models/
│   ├── User.js                 # Modelo de usuario con cart
│   ├── Cart.js                 # Modelo de carrito
│   └── Product.js              # Modelo de producto
├── routes/
│   ├── sessions.routes.js      # Rutas de autenticación (con /current)
│   ├── views.routes.js         # Rutas de vistas
│   └── products.routes.js      # Rutas de productos
├── utils/
│   ├── hashUtils.js            # Utilidades de bcrypt (hashSync)
│   └── jwtUtils.js             # Utilidades JWT (generate, verify, extract)
├── views/
│   ├── layouts/
│   │   └── main.handlebars     # Layout principal
│   ├── login.handlebars        # Vista de login (guarda JWT)
│   ├── register.handlebars     # Vista de registro (guarda JWT)
│   └── products.handlebars     # Vista de productos
├── public/
│   └── css/
│       └── styles.css          # Estilos CSS
├── .env.example                # Ejemplo de variables de entorno
├── .gitignore                  # Archivos ignorados
├── test-jwt.rest               # Archivo de pruebas JWT
├── app.js                      # Servidor principal
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

## 🔐 Sistema de Autenticación JWT

### Flujo de Autenticación

1. **Registro/Login:**
   - Usuario envía credenciales
   - Servidor valida con Passport
   - Genera JWT con `jsonwebtoken`
   - Retorna token al cliente
   - Cliente guarda token en `localStorage`

2. **Peticiones autenticadas:**
   - Cliente envía token en header `Authorization: Bearer {token}`
   - Middleware `authMiddleware` valida el token
   - Si es válido, agrega `req.user` con los datos del usuario
   - Continúa con la petición

3. **Logout:**
   - Cliente elimina token de `localStorage`
   - Sesión destruida en servidor

### Passport Strategies Implementadas

#### 1. **Local Strategy - Registro**
```javascript
passport.use('register', ...)
```
- Valida datos del usuario
- Hashea contraseña con `bcrypt.hashSync()`
- Crea carrito para el usuario
- Asigna rol automáticamente
- Genera JWT

#### 2. **Local Strategy - Login**
```javascript
passport.use('login', ...)
```
- Verifica existencia del usuario
- Compara contraseña con `bcrypt.compareSync()`
- Genera JWT
- Crea sesión

#### 3. **GitHub Strategy**
```javascript
passport.use('github', ...)
```
- Autenticación OAuth 2.0
- Obtiene datos del perfil de GitHub
- Crea carrito y usuario si no existe
- Genera JWT automáticamente

#### 4. **JWT Strategy**
```javascript
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

## 🧪 Probando el Sistema JWT

### Usando el archivo `test-jwt.rest`

Si usas VS Code con la extensión REST Client:

1. **Registrar usuario:**
```http
POST http://localhost:8080/api/sessions/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 25,
  "password": "12345"
}
```

2. **Login (obtienes el token):**
```http
POST http://localhost:8080/api/sessions/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "12345"
}
```

3. **Usar ruta /current (con el token):**
```http
GET http://localhost:8080/api/sessions/current
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Usando Postman

1. Registrar/Login → Copiar el `token` de la respuesta
2. En `/current`:
   - Headers → Key: `Authorization` → Value: `Bearer {tu_token}`

### Usando el Frontend

1. Registrarse o hacer login
2. El token se guarda automáticamente en `localStorage`
3. Abrir consola del navegador:
```javascript
localStorage.getItem('token')
```

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

## 📊 Comparación: Sesiones vs JWT

| Característica | Sesiones | JWT |
|---------------|----------|-----|
| Almacenamiento | Servidor (MongoDB) | Cliente (localStorage) |
| Escalabilidad | Requiere store compartido | Stateless, fácil escalar |
| Seguridad | Cookies HttpOnly | Header Authorization |
| Expiración | Configurable en servidor | En el token mismo |
| **Uso en este proyecto** | **Compatibilidad vistas** | **API principal** |

## 🚀 Próximos Pasos

- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Verificación de email
- [ ] Recuperación de contraseña
- [ ] Roles personalizados
- [ ] Permisos granulares
- [ ] Más providers OAuth (Google, Facebook)

## 📧 Contacto

Para cualquier consulta o sugerencia sobre el proyecto.

## 📄 Licencia

ISC