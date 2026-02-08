import { generateToken } from '../utils/jwtUtils.js';
import { createHash, isValidPassword } from '../utils/hashUtils.js';
import { UserAuthDTO } from '../dtos/userDTO.js';
import UserRepository from '../repositories/userRepository.js';
import EmailService from '../services/emailService.js';
import crypto from 'crypto';

/**
 * SessionController - Controlador mejorado para autenticación
 * Responsabilidad: Manejar lógica de autenticación, contraseñas y sesiones
 */

class SessionController {
  /**
   * Manejar registro de usuario
   */
  static async handleRegister(req, res) {
    try {
      // Generar JWT
      const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });

      // Crear DTO (sin datos sensibles)
      const userDTO = new UserAuthDTO(req.user);

      // Enviar email de bienvenida (sin bloquear la respuesta)
      EmailService.sendWelcomeEmail(
        req.user.email,
        `${req.user.first_name} ${req.user.last_name}`
      ).catch(err => console.error('Error enviando email de bienvenida:', err));

      res.json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        token,
        user: userDTO
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al procesar registro',
        error: error.message
      });
    }
  }

  /**
   * Manejar login de usuario
   */
  static async handleLogin(req, res) {
    try {
      // Generar JWT
      const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });

      console.log('✓ Token generado:', token.substring(0, 20) + '...');

      // Crear sesión para compatibilidad
      if (req.session) {
        req.session.user = {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        };
      }

      // Crear DTO
      const userDTO = new UserAuthDTO(req.user);

      res.json({
        status: 'success',
        message: 'Login exitoso',
        token,
        user: userDTO,
        redirect: '/products'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al procesar login',
        error: error.message
      });
    }
  }

  /**
   * Manejar callback de GitHub OAuth
   */
  static async handleGithubCallback(req, res) {
    try {
      // Generar JWT
      const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });

      // Guardar en sesión
      if (req.session) {
        req.session.user = {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        };
      }

      res.redirect(`/products?token=${token}`);
    } catch (error) {
      console.error('Error en GitHub callback:', error);
      res.redirect('/login');
    }
  }

  /**
   * Obtener datos del usuario actual (con DTO - sin datos sensibles)
   */
  static async handleGetCurrent(req, res) {
    try {
      // Crear DTO sin datos sensibles
      const userDTO = new UserAuthDTO(req.user);

      res.json({
        status: 'success',
        user: userDTO
      });
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener datos del usuario'
      });
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email requerido'
        });
      }

      // Buscar usuario por email
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        // No revelar si el usuario existe o no (seguridad)
        return res.json({
          status: 'success',
          message: 'Si el email existe, se enviará un enlace de recuperación'
        });
      }

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Guardar token en base de datos
      await UserRepository.setPasswordResetToken(user._id, resetToken, expiresAt);

      // Enviar email
      await EmailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${user.first_name} ${user.last_name}`
      );

      res.json({
        status: 'success',
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al solicitar recuperación de contraseña'
      });
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      // Validaciones
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Token, contraseña y confirmación requeridos'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Las contraseñas no coinciden'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar token
      const user = await UserRepository.verifyPasswordResetToken(token);

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
      }

      // Verificar que no sea la misma contraseña
      const isSamePassword = isValidPassword(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          status: 'error',
          message: 'No puedes usar la misma contraseña anterior'
        });
      }

      // Hash de la nueva contraseña
      const hashedPassword = createHash(newPassword);

      // Actualizar contraseña y limpiar token
      await UserRepository.updatePassword(user._id, hashedPassword);
      await UserRepository.clearPasswordResetToken(user._id);

      res.json({
        status: 'success',
        message: 'Contraseña actualizada exitosamente',
        redirect: '/login'
      });
    } catch (error) {
      console.error('Error en resetPassword:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al restablecer contraseña'
      });
    }
  }

  /**
   * Manejar logout
   */
  static async handleLogout(req, res) {
    try {
      if (req.session) {
        req.session.destroy(err => {
          if (err) {
            console.error('Error destruyendo sesión:', err);
            return res.status(500).json({
              status: 'error',
              message: 'Error al cerrar sesión'
            });
          }

          res.json({
            status: 'success',
            message: 'Sesión cerrada exitosamente',
            redirect: '/login'
          });
        });
      } else {
        res.json({
          status: 'success',
          message: 'Sesión cerrada exitosamente',
          redirect: '/login'
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al cerrar sesión'
      });
    }
  }
}

export default SessionController;
