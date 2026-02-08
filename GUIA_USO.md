# 📖 Guía de Uso del Backend

## 🔐 Ejemplo de Flujo de Autenticación

### 1. Registro
```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "age": 28,
    "password": "MiPassword123"
  }'
```

**Respuesta (éxito):**
```json
{
  "status": "success",
  "payload": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "age": 28,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiPassword123"
  }'
```

**Respuesta:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

### 3. Usar Token en Solicitudes
```bash
curl http://localhost:8080/api/sessions/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

## 🛍️ Ejemplo de Flujo de Compra

### 1. Obtener Carrito
```bash
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439012",
    "products": [],
    "total": 0
  }
}
```

### 2. Agregar Productos al Carrito
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439013",
    "quantity": 2
  }'
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439012",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Laptop",
        "price": 1000,
        "quantity": 2
      }
    ],
    "total": 2000
  }
}
```

### 3. Actualizar Cantidad de Producto
```bash
curl -X PUT http://localhost:8080/api/cart/update/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

### 4. Procesar Compra
```bash
curl -X POST http://localhost:8080/api/purchases/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Respuesta (éxito):**
```json
{
  "status": "success",
  "message": "Compra procesada exitosamente",
  "payload": {
    "_id": "507f1f77bcf86cd799439014",
    "code": "TC-2024-0001",
    "date": "2024-01-15T10:30:00Z",
    "amount": 2000,
    "purchaser": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "juan@example.com",
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Laptop",
        "quantity": 2,
        "price": 1000
      }
    ],
    "unavailable_products": []
  }
}
```

### 5. Ver Compras del Usuario
```bash
curl "http://localhost:8080/api/purchases/my-tickets?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "tickets": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "code": "TC-2024-0001",
        "date": "2024-01-15T10:30:00Z",
        "amount": 2000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

## 👨‍💼 Admin: Gestión de Productos

### 1. Crear Producto (Admin Only)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop Pro",
    "description": "Laptop de última generación",
    "code": "LAP-001",
    "price": 1500,
    "status": true,
    "stock": 10,
    "category": "Electrónica"
  }'
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Producto creado exitosamente",
  "payload": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Laptop Pro",
    "code": "LAP-001",
    "price": 1500,
    "stock": 10
  }
}
```

### 2. Actualizar Producto (Admin Only)
```bash
curl -X PUT http://localhost:8080/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1400,
    "stock": 8
  }'
```

### 3. Eliminar Producto (Admin Only)
```bash
curl -X DELETE http://localhost:8080/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer <token_admin>"
```

### 4. Listar Todos los Tickets (Admin Only)
```bash
curl "http://localhost:8080/api/purchases/admin/all-tickets?page=1&limit=10" \
  -H "Authorization: Bearer <token_admin>"
```

### 5. Ver Estadísticas de Ventas (Admin Only)
```bash
curl http://localhost:8080/api/purchases/admin/statistics \
  -H "Authorization: Bearer <token_admin>"
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": {
    "total_revenue": 5000,
    "total_sales": 2,
    "average_ticket": 2500,
    "top_products": [
      {
        "product_id": "507f1f77bcf86cd799439013",
        "name": "Laptop",
        "total_sold": 5,
        "revenue": 5000
      }
    ]
  }
}
```

## 🔑 Recuperación de Contraseña

### 1. Solicitar Reset
```bash
curl -X POST http://localhost:8080/api/sessions/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com"
  }'
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Email de recuperación enviado"
}
```

### 2. Restablecer Contraseña
Recibirás un email con un link. Haz click en él o usa el token:

```bash
curl -X POST http://localhost:8080/api/sessions/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_del_email",
    "new_password": "NuevaPassword123"
  }'
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Contraseña actualizada exitosamente"
}
```

## ⚠️ Manejo de Errores

### Error: Producto sin stock
```json
{
  "status": "partial",
  "message": "Compra procesada parcialmente",
  "payload": {
    "code": "TC-2024-0002",
    "amount": 1000,
    "products": [
      {
        "name": "Laptop",
        "quantity": 1,
        "price": 1000
      }
    ],
    "unavailable_products": [
      {
        "product_id": "507f1f77bcf86cd799439016",
        "reason": "Insufficient stock"
      }
    ]
  }
}
```

### Error: No autorizado
```json
{
  "status": "error",
  "message": "No autorizado - Token faltante"
}
```

### Error: Rol insuficiente
```json
{
  "status": "error",
  "message": "Solo administradores pueden realizar esta acción"
}
```

## 🧪 Probando con REST Client (VS Code)

Usa el archivo `test-jwt.rest` en VS Code con extensión REST Client:

```rest
### Registrar usuario
POST http://localhost:8080/api/sessions/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 25,
  "password": "12345"
}

### Login
POST http://localhost:8080/api/sessions/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "12345"
}

### Usuario actual
GET http://localhost:8080/api/sessions/current
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Obtener carrito
GET http://localhost:8080/api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Agregar al carrito
POST http://localhost:8080/api/cart/add
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 2
}
```

## 📧 Pruebas de Email (Mailtrap)

1. Ve a https://mailtrap.io/
2. Inicia sesión
3. Ve a "Inbox"
4. Ejecuta acciones que generan emails:
   - Registra un usuario (welcome email)
   - Solicita reset de contraseña (reset email)
   - Realiza una compra (order confirmation email)

Verás los emails en el inbox de Mailtrap.

## 🔗 URLs Principales

| Página | URL |
|--------|-----|
| Home | http://localhost:8080/ |
| Registro | http://localhost:8080/register |
| Login | http://localhost:8080/login |
| Productos | http://localhost:8080/products |
| Carrito | http://localhost:8080/cart |
| Debug | http://localhost:8080/debug |

## 📝 Notas Importantes

- Los tokens JWT expiran en 24 horas
- Los tokens de reset de contraseña expiran en 1 hora
- Solo administradores pueden crear/editar/eliminar productos
- El carrito es persistente por usuario
- Las compras generan un ticket único con código
- Los emails se envían automáticamente (requiere SMTP configurado)
- Las contraseñas se hashean con bcrypt (no se guardan en texto plano)

---

Para más información, ver `ARQUITECTURA_FINAL.md`
