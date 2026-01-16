# Sistema de Login con Passport y GitHub OAuth - E-Commerce

Sistema completo de autenticación con Passport.js, gestión de sesiones, roles de usuario y autenticación con GitHub OAuth.

## 🚀 Características

- ✅ **Registro de usuarios** con validación y Passport Local Strategy
- ✅ **Login seguro** con Passport y bcrypt (contraseñas hasheadas)
- ✅ **Autenticación con GitHub** OAuth 2.0
- ✅ **Sistema de roles** (Admin/Usuario)
- ✅ **Gestión de sesiones** con MongoDB
- ✅ **Protección de rutas** con middlewares
- ✅ **Interfaz responsive** con Handlebars
- ✅ **Catálogo de productos**
- ✅ **Mensaje de bienvenida** personalizado

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MongoDB instalado y corriendo localmente
- Cuenta de GitHub para OAuth (opcional)
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd login-system-ecommerce
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
login-system-ecommerce/
├── config/
│   └── passport.config.js      # Configuración de Passport
├── models/
│   └── User.js                 # Modelo de usuario (Mongoose)
├── routes/
│   ├── sessions.routes.js      # Rutas de autenticación
│   ├── views.routes.js         # Rutas de vistas
│   └── products.routes.js      # Rutas de productos
├── utils/
│   └── hashUtils.js            # Utilidades de bcrypt
├── views/
│   ├── layouts/
│   │   └── main.handlebars     # Layout principal
│   ├── login.handlebars        # Vista de login
│   ├── register.handlebars     # Vista de registro
│   └── products.handlebars     # Vista de productos
├── public/
│   └── css/
│       └── styles.css          # Estilos CSS
├── .env.example                # Ejemplo de variables de entorno
├── .gitignore                  # Archivos ignorados
├── app.js                      # Servidor principal
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

## 🔐 Sistema de Autenticación

### Passport Strategies Implementadas

#### 1. **Local Strategy - Registro**
- Valida datos del usuario
- Hashea la contraseña con bcrypt (10 rounds)
- Asigna rol automáticamente
- Crea usuario en MongoDB

#### 2. **Local Strategy - Login**
- Verifica existencia del usuario
- Compara contraseña con bcrypt
- Crea sesión de usuario

#### 3. **GitHub Strategy**
- Autenticación OAuth 2.0
- Obtiene datos del perfil de GitHub
- Crea o encuentra usuario existente
- Login automático después de autorización

## 🔒 Sistema de Roles

### Usuario Administrador
- **Email:** `adminCoder@coder.com`
- **Contraseña:** La que definas al registrarte
- **Rol:** Admin (automático)
- **Indicador:** 👑 Administrador

### Usuario Regular
- **Email:** Cualquier otro email
- **Rol:** Usuario (por defecto)
- **Indicador:** 👤 Usuario

### Usuarios de GitHub
- **Rol:** Usuario (por defecto)
- **Sin contraseña local** (autenticación vía GitHub)

## 🛣️ Rutas Principales

### Vistas
- `GET /` - Redirige a login o productos según sesión
- `GET /login` - Página de login
- `GET /register` - Página de registro
- `GET /products` - Catálogo de productos (protegido)

### API - Autenticación
- `POST /api/sessions/register` - Registro con Passport Local
- `POST /api/sessions/login` - Login con Passport Local
- `GET /api/sessions/github` - Iniciar OAuth con GitHub
- `GET /api/sessions/github/callback` - Callback de GitHub
- `POST /api/sessions/logout` - Cerrar sesión
- `GET /api/sessions/current` - Usuario actual

### API - Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID

## 🔐 Seguridad

### Hashing con bcrypt
```javascript
// Crear hash
const hashedPassword = createHash(password);

// Verificar contraseña
const isValid = isValidPassword(password, hashedPassword);
```

### Características de Seguridad
- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ Sesiones almacenadas en MongoDB
- ✅ Protección de rutas con middlewares
- ✅ Validación de datos en frontend y backend
- ✅ Cookie con expiración de 1 hora
- ✅ OAuth 2.0 con GitHub
- ✅ Serialización/Deserialización de usuarios con Passport

## 💡 Funcionalidades por Método

### 1. Registro Local
1. Usuario completa formulario
2. Passport Strategy `register` valida datos
3. Contraseña se hashea con bcrypt
4. Usuario se guarda en MongoDB
5. Redirección a login

### 2. Login Local
1. Usuario ingresa credenciales
2. Passport Strategy `login` busca usuario
3. bcrypt compara contraseñas
4. Sesión se crea en MongoDB
5. Redirección a productos

### 3. Login con GitHub
1. Usuario click en "Continuar con GitHub"
2. Redirección a GitHub OAuth
3. Usuario autoriza la aplicación
4. GitHub envía datos de perfil
5. Sistema busca o crea usuario
6. Sesión se crea automáticamente
7. Redirección a productos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Passport.js** - Autenticación
  - passport-local
  - passport-github2

### Base de Datos
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Seguridad
- **bcrypt** - Hashing de contraseñas
- **express-session** - Gestión de sesiones
- **connect-mongo** - Store de sesiones en MongoDB

### Frontend
- **Handlebars** - Motor de templates
- **CSS3** - Estilos modernos

## 📝 Diferencias vs Versión Anterior

| Característica | Versión Anterior | Versión con Passport |
|---------------|------------------|----------------------|
| Autenticación | Manual con bcrypt | **Passport Strategies** |
| Login Local | Ruta personalizada | **passport-local** |
| OAuth | No disponible | **passport-github2** |
| Hashing | En ruta | **Utilidad reutilizable** |
| Código | Más verboso | **Más modular y limpio** |
| Escalabilidad | Limitada | **Fácil agregar strategies** |

## 🐛 Troubleshooting

### MongoDB no conecta
```bash
mongod --version
mongod
```

### GitHub OAuth no funciona
- Verifica que las URLs coincidan exactamente
- Callback debe ser: `http://localhost:8080/api/sessions/github/callback`
- Verifica que CLIENT_ID y CLIENT_SECRET sean correctos
- Asegúrate de que el `.env` esté cargado

### Error: Cannot find module 'passport'
```bash
npm install
```

### Sesión no persiste
- Verifica que MongoDB esté corriendo
- Verifica que la conexión a MongoDB sea exitosa
- Revisa la configuración de cookies

## 🚀 Próximos Pasos

- [ ] Agregar más strategies (Google, Facebook, Twitter)
- [ ] Implementar recuperación de contraseña
- [ ] Agregar verificación de email
- [ ] Implementar refresh tokens
- [ ] Agregar sistema de permisos granulares
- [ ] Implementar rate limiting

## 📧 Contacto

Para cualquier consulta o sugerencia, no dudes en contactar.

## 📄 Licencia

ISC