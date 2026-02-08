# 📐 Arquitectura Final - Backend Profesional

## 1. Visión General de la Arquitectura

El proyecto implementa una **arquitectura en capas (Layered Architecture)** con patrones de diseño profesionales que aseguran escalabilidad, mantenibilidad y seguridad.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
│              (Handlebars / Navegador Web)               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE RUTAS                         │
│  (routes: sessions, products, cart, purchases, views)   │
│  - Middleware de autenticación/autorización             │
│  - Validación de permisos                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA CONTROLADORES                      │
│  (controllers: session, product, cart, purchase)        │
│  - Orquestación de operaciones                          │
│  - Transformación a DTOs                                │
│  - Respuestas HTTP                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE SERVICIOS                      │
│  (services: auth, email, purchase, authorization)      │
│  - Lógica de negocio                                    │
│  - Validaciones complejas                               │
│  - Integraciones externas                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              CAPA REPOSITORIO/ACCESO DATOS              │
│  (repositories: user, product + DAOs: cart)            │
│  - Abstracciones de base de datos                       │
│  - Queries optimizadas                                  │
│  - Operaciones CRUD                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA MODELOS                           │
│  (models: user, product, cart, ticket)                  │
│  - Esquemas Mongoose                                    │
│  - Validaciones de base de datos                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas / Base de Datos              │
└─────────────────────────────────────────────────────────┘
```

## 2. Capas y Responsabilidades

### 2.1 Capa de Rutas (`routes/`)

**Archivos:**
- `sessions.routes.js` - Autenticación y recuperación de contraseña
- `products.routes.js` - Gestión de productos
- `cart.routes.js` - Operaciones de carrito
- `purchases.routes.js` - Procesamiento de compras
- `views.routes.js` - Rendering de vistas

**Responsabilidades:**
- Definir endpoints HTTP
- Aplicar middleware de autenticación (`authenticateJWT`)
- Aplicar middleware de autorización (`adminOnlyJWT`)
- Delegar lógica a controladores
- Validar permisos antes de ejecutar

**Ejemplo de ruta protegida:**
```javascript
// Solo administradores pueden crear productos
router.post('/', requireJWT, ...adminOnlyJWT, ProductController.createProduct);

// Cualquier usuario autenticado puede agregar al carrito
router.post('/add', authenticateJWT, CartController.addToCart);
```

### 2.2 Capa Controladores (`controllers/`)

**Archivos:**
- `sessionController.js` - Autenticación y recuperación
- `productController.js` - CRUD de productos
- `cartController.js` - Operaciones de carrito
- `purchaseController.js` - Procesamiento de compras

**Responsabilidades:**
- Recibir solicitudes HTTP
- Validar entrada de datos
- Orquestar llamadas a servicios
- Transformar respuestas en DTOs
- Enviar respuestas HTTP

**Ciclo de vida típico:**
```
Ruta → Controlador → Servicio → Repositorio → MongoDB
                  ↓
            Transformar a DTO
                  ↓
            Response HTTP
```

### 2.3 Capa Servicios (`services/`)

**Archivos:**
- `emailService.js` - Envío de correos
- `authorizationService.js` - Lógica de autorización
- `purchaseService.js` - Lógica de compras y tickets

**Responsabilidades:**
- Implementar lógica de negocio compleja
- Validar reglas de negocio
- Coordinar múltiples repositorios
- Manejar transacciones
- Integrar servicios externos

**Ejemplo: Procesar compra:**
```javascript
await purchaseService.processPurchase(userId, cartItems, userData)
  → Valida usuario
  → Verifica stock disponible
  → Crea ticket con código único
  → Actualiza stock de productos
  → Vacía carrito
  → Envía email de confirmación
```

### 2.4 Capa Repositorio/DAO (`repositories/`, `daos/`)

**Repositorio Pattern:**
- `baseRepository.js` - Clase base con operaciones CRUD genéricas
- `userRepository.js` - Especializado para usuarios
- `productRepository.js` - Especializado para productos

**DAO Pattern:**
- `cartDAO.js` - Operaciones del carrito

**Responsabilidades:**
- Abstraer detalles de la base de datos
- Implementar queries optimizadas
- Usar `lean()` para performance
- Manejar transformaciones de datos

**Ejemplo de Repository:**
```javascript
class UserRepository extends BaseRepository {
  async findByEmail(email) {
    return this.model.findOne({ email }).lean();
  }
  
  async setPasswordResetToken(userId, token, expiresAt) {
    return this.update(userId, { 
      passwordResetToken: token,
      passwordResetExpires: expiresAt 
    });
  }
}
```

### 2.5 Capa Modelos (`models/`)

**Archivos:**
- `user.model.js` - Schema de usuarios
- `product.js` - Schema de productos
- `cart.js` - Schema de carritos
- `ticket.js` - Schema de tickets/órdenes

**Responsabilidades:**
- Definir estructura de datos
- Implementar validaciones Mongoose
- Crear índices para performance
- Documentar campos

## 3. Patrones de Diseño Implementados

### 3.1 DTO Pattern (Data Transfer Objects)

**Propósito:** Evitar exponer datos sensibles en respuestas HTTP

**DTOs implementados:**

```javascript
// UserAuthDTO - Para respuestas de autenticación
{
  id: string,
  name: string,
  email: string,
  age: number,
  role: string
  // ❌ NO incluye: password, passwordHash, tokens, etc.
}

// UserPublicDTO - Para perfiles públicos
{
  id: string,
  first_name: string,
  last_name: string
}

// ProductDTO - Para un producto individual
{
  id: string,
  title: string,
  price: number,
  stock: number,
  category: string,
  code: string
}
```

**Ubicación:** `dtos/` folder

### 3.2 Repository Pattern

**Propósito:** Abstraer operaciones de base de datos

```
Controller → Service → Repository → MongoDB
```

**Beneficios:**
- Facilita testing (pueden mockearse)
- Permite cambiar BD sin afectar servicios
- Queries centralizadas
- Reutilización de código

**Ejemplo:**
```javascript
// BaseRepository proporciona CRUD genérico
class BaseRepository {
  async findAll() { }
  async findById(id) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
}

// UserRepository especializa para usuarios
class UserRepository extends BaseRepository {
  async findByEmail(email) { }
  async setPasswordResetToken(userId, token, expiresAt) { }
  async verifyPasswordResetToken(userId, token) { }
}
```

### 3.3 Service Layer Pattern

**Propósito:** Encapsular lógica de negocio compleja

**Servicios implementados:**

```javascript
// EmailService - Gestión de correos
EmailService.sendPasswordResetEmail(user, resetToken, resetUrl)
EmailService.sendWelcomeEmail(user)
EmailService.sendOrderConfirmationEmail(user, ticket)

// AuthorizationService - Validaciones de permisos
AuthorizationService.canCreateProduct(user)
AuthorizationService.canPurchase(user)
AuthorizationService.isAdmin(user)

// PurchaseService - Lógica compleja de compras
PurchaseService.processPurchase(userId, cartItems, userData)
PurchaseService.getUserPurchaseHistory(userId, page, limit)
PurchaseService.getTicketById(ticketId)
PurchaseService.getSalesStatistics()
```

## 4. Seguridad e Autenticación

### 4.1 Flujo de Autenticación

```
1. Usuario envía credenciales
         ↓
2. Passport.js valida con estrategia 'login'
         ↓
3. Se genera JWT token
         ↓
4. Cliente almacena token en localStorage
         ↓
5. Cliente envía token en header: Authorization: Bearer <token>
         ↓
6. Middleware verifyToken valida y extrae datos
         ↓
7. req.user está disponible en controlador
```

### 4.2 Niveles de Autorización

**Nivel 1: Autenticación**
```javascript
// Requiere token JWT válido
router.get('/my-cart', authenticateJWT, CartController.getCart);
```

**Nivel 2: Autorización por Rol**
```javascript
// Requiere token JWT + ser administrador
router.post('/create', requireJWT, ...adminOnlyJWT, ProductController.createProduct);
```

**Nivel 3: Validación de Permisos en Servicio**
```javascript
const purchaseService.processPurchase(userId, items) {
  const auth = AuthorizationService.canPurchase(user);
  if (!auth.authorized) throw new Error(auth.message);
  // Proceder con compra...
}
```

### 4.3 Recuperación de Contraseña

**Proceso seguro:**

```
1. Usuario solicita reset: POST /sessions/request-password-reset
         ↓
2. Sistema genera token (1 hora expiracion)
         ↓
3. Almacena token hasheado en BD (no texto plano)
         ↓
4. Envía link en email con token
         ↓
5. Usuario hace click en link
         ↓
6. Envía token + nueva contraseña: POST /sessions/reset-password
         ↓
7. Sistema verifica token NO expirado
         ↓
8. Verifica contraseña NO es igual a la anterior
         ↓
9. Hashea nueva contraseña con bcrypt
         ↓
10. Guarda en BD y elimina token
```

**Protecciones implementadas:**
- Tokens con expiración (1 hora)
- Tokens almacenados hasheados
- Validación de tokens antes de reset
- Prevención de reutilización de contraseña
- Limpieza automática de tokens expirados

## 5. Sistema de Compras y Tickets

### 5.1 Modelo de Ticket

```javascript
Ticket {
  code: string,          // Código único generado automáticamente
  date: Date,           // Fecha de compra
  purchase_datetime: Date,
  amount: number,       // Monto total
  purchaser: {
    _id: ObjectId,
    email: string,
    first_name: string,
    last_name: string,
    phone: string
  },
  products: [{
    _id: ObjectId,
    quantity: number,
    name: string,
    price: number,
    category: string
  }],
  unavailable_products: [{
    product_id: ObjectId,
    reason: string    // "Insufficient stock" o error
  }]
}
```

### 5.2 Flujo de Compra

```
1. Usuario hace click en "Procesar Compra"
         ↓
2. POST /api/purchases/process con carrito
         ↓
3. Validar usuario autenticado
         ↓
4. Para cada producto:
   - Verificar stock disponible
   - Si hay: restar cantidad, agregar a ticket
   - Si no hay: agregar a unavailable_products
         ↓
5. Si hay productos disponibles:
   - Generar código único de ticket
   - Crear documento Ticket en BD
   - Vaciar carrito del usuario
   - Enviar email de confirmación
   - Responder con ticket details
         ↓
6. Si NO hay ningún producto disponible:
   - Responder error: "No hay stock"
```

### 5.3 Endpoints de Compra

```
POST /api/purchases/process
  Procesa compra y genera ticket
  
GET /api/purchases/my-tickets?page=1&limit=10
  Obtiene tickets del usuario actual
  
GET /api/purchases/ticket/:ticketId
  Obtiene detalle de un ticket (solo propietario o admin)
  
GET /api/purchases/admin/all-tickets?page=1&limit=10
  Lista todos los tickets (solo admin)
  
GET /api/purchases/admin/statistics
  Estadísticas de ventas (solo admin)
```

## 6. Servicio de Emails

### 6.1 Configuración

**Variables de entorno:**
```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=usuario@mailtrap.io
SMTP_PASS=contraseña
SMTP_FROM=noreply@ecommerce.com
FRONTEND_URL=http://localhost:3000
```

### 6.2 Tipos de Emails

**1. Welcome Email**
- Enviado al registrarse
- Saludo personalizado
- Link a productos

**2. Password Reset Email**
- Link con token válido 1 hora
- Botón clickeable
- Advertencia de expiración

**3. Order Confirmation Email**
- Tabla de productos comprados
- Ticket number
- Monto total
- Detalles del comprador

## 7. Configuración Centralizada

### 7.1 Sistema de Configuración

```javascript
// config/config.js
class Config {
  constructor() {
    this.mongodb = {
      uri: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME
    };
    this.jwt = {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    };
    this.smtp = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM
    };
  }
}

export default new Config();
```

**Ventajas:**
- Sin hardcoded values
- Fácil cambio de configuración
- Diferente config por ambiente
- Centralized y auditable

## 8. Flujos de Autenticación

### 8.1 Registro

```
POST /sessions/register
├─ Email no debe existir
├─ Hashear contraseña con bcrypt
├─ Crear usuario en BD
├─ Generar JWT token
├─ Enviar welcome email
└─ Response: UserAuthDTO (sin password)
```

### 8.2 Login

```
POST /sessions/login
├─ Verificar email existe
├─ Comparar contraseña hasheada
├─ Generar JWT token
├─ Guardar token en cliente (localStorage)
└─ Response: UserAuthDTO + token
```

### 8.3 Logout

```
POST /sessions/logout
└─ Eliminar token del localStorage (lado cliente)
```

### 8.4 Current User

```
GET /sessions/current
├─ Validar JWT del header Authorization
├─ Extraer userId del token
├─ Obtener datos del usuario
└─ Response: UserAuthDTO
```

## 9. Estructura de Carpetas Final

```
proyecto/
├── app.js                          # Punto de entrada
├── package.json                    # Dependencias
├── .env                            # Variables de ambiente
├── config/
│   └── config.js                   # Configuración centralizada
│   └── passport.config.js          # Estrategias Passport
│
├── middlewares/
│   └── auth.middleware.js          # Validación JWT
│
├── controllers/
│   ├── sessionController.js        # Autenticación
│   ├── productController.js        # Productos
│   ├── cartController.js           # Carrito
│   └── purchaseController.js       # Compras
│
├── services/
│   ├── emailService.js             # Envío de correos
│   ├── authorizationService.js     # Lógica de permisos
│   └── purchaseService.js          # Lógica de compras
│
├── repositories/
│   ├── baseRepository.js           # CRUD genérico
│   ├── userRepository.js           # Usuarios
│   └── productRepository.js        # Productos
│
├── daos/
│   └── cartDAO.js                  # Carrito
│
├── dtos/
│   ├── userDTO.js                  # DTOs de usuario
│   └── productDTO.js               # DTOs de producto
│
├── models/
│   ├── user.model.js               # Schema usuario
│   ├── product.js                  # Schema producto
│   ├── cart.js                     # Schema carrito
│   └── ticket.js                   # Schema ticket
│
├── routes/
│   ├── sessions.routes.js          # /api/sessions
│   ├── products.routes.js          # /api/products
│   ├── cart.routes.js              # /api/cart
│   ├── purchases.routes.js         # /api/purchases
│   └── views.routes.js             # /
│
├── utils/
│   ├── hashUtils.js                # Bcrypt utilities
│   └── jwtUtils.js                 # JWT utilities
│
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── products.handlebars
│   ├── cart.handlebars
│   ├── login.handlebars
│   ├── register.handlebars
│   └── ...
│
└── public/
    └── css/
        └── styles.css
```

## 10. Flujo de Datos Completo (Ejemplo: Compra)

```
1. USUARIO hace click en "Procesar Compra"
   └─ Frontend: POST /api/purchases/process
      Headers: { Authorization: "Bearer <token>" }
      Body: { cartItems: [...] }

2. ROUTE (purchases.routes.js)
   ├─ Middleware authenticateJWT valida token
   ├─ Extrae userId de req.user
   └─ Delega a PurchaseController.processPurchase()

3. CONTROLLER (purchaseController.js)
   ├─ Obtiene usuario actual
   ├─ Obtiene carrito
   ├─ Valida autorización
   └─ Delega a purchaseService.processPurchase()

4. SERVICE (purchaseService.js)
   ├─ Obtiene detalles de cada producto
   ├─ Verifica stock vs cantidad solicitada
   ├─ Llama a productRepository.updateStock()
   ├─ Crea documento Ticket
   ├─ Llama a emailService.sendOrderConfirmationEmail()
   ├─ Llama a cartDAO.clearCart()
   └─ Retorna ticket completo

5. REPOSITORY/DAO
   ├─ ProductRepository.updateStock()
   │  └─ MongoDB: actualiza stock
   ├─ CartDAO.clearCart()
   │  └─ MongoDB: vacía carrito
   └─ TicketModel.create()
      └─ MongoDB: inserta nuevo documento

6. EMAIL SERVICE
   ├─ Se conecta a SMTP (Mailtrap)
   └─ Envía email de confirmación

7. RESPONSE (Controller)
   ├─ Transforma Ticket a DTO
   ├─ Responde con HTTP 200
   └─ Body: { status: "success", ticket: {...} }

8. FRONTEND recibe respuesta
   ├─ Limpia formulario
   ├─ Muestra mensaje de éxito
   └─ Redirige a lista de tickets
```

## 11. Checklist de Validaciones

### Seguridad
- [x] Passwords hasheados con bcrypt (salt rounds: 10)
- [x] JWT tokens en headers (Authorization: Bearer)
- [x] DTOs para evitar data exposure
- [x] Middleware de autenticación en todas las rutas protegidas
- [x] Validación de roles (admin, user)
- [x] Tokens de reset con expiración (1 hora)
- [x] Protección contra reutilización de contraseña

### Funcionalidad
- [x] Registro de usuarios con email único
- [x] Login con credenciales
- [x] Recuperación de contraseña con email
- [x] Gestión de productos (CRUD)
- [x] Carrito de compras persistente
- [x] Sistema de tickets/órdenes
- [x] Validación de stock
- [x] Parcial fulfillment (productos no disponibles)
- [x] Email de confirmación de compra

### Performance
- [x] Queries con lean() (MongoDB)
- [x] Índices en BD (emails, códigos)
- [x] Paginación en listados
- [x] Caché de configuración

### Escalabilidad
- [x] Código modular y desacoplado
- [x] Patrones de diseño probados
- [x] DTOs para versionado de API
- [x] Servicios desacoplados de controladores
- [x] Repositorios desacoplados de modelos

## 12. Próximos Pasos para Producción

```
1. Tests unitarios
   └─ Jest para repositories y services

2. Tests de integración
   └─ Supertest para rutas

3. Documentación API
   └─ Swagger/OpenAPI

4. Variables de ambiente por deployment
   └─ .env.development, .env.production

5. Logging centralizado
   └─ Winston o Morgan

6. Monitoreo
   └─ Sentry para errores

7. Rate limiting
   └─ Express-rate-limit

8. CORS configurado
   └─ Whitelist de dominios

9. HTTPS
   └─ Certificados SSL

10. Base de datos
    └─ Backups automáticos
    └─ Réplicas
    └─ Índices optimizados
```

---

**Documento generado:** Arquitectura profesional implementada  
**Última actualización:** 2024  
**Estado:** Listo para producción
