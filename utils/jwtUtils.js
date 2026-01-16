import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'coderSecretJWT2024';

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {String} expiresIn - Tiempo de expiración (default: '24h')
 * @returns {String} Token JWT
 */
export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Extrae el token del header Authorization
 * @param {Object} req - Request object
 * @returns {String|null} Token extraído o null
 */
export const extractToken = (req) => {
  // Buscar en header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  
  // Buscar en cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};