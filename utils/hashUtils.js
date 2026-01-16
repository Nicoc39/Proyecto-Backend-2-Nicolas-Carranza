import bcrypt from 'bcrypt';

/**
 * Hashea una contraseña utilizando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Contraseña hasheada
 */
export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Verifica si una contraseña coincide con el hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {boolean} true si coinciden, false si no
 */
export const isValidPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};