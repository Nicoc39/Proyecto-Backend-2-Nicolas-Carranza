/**
 * UserRepository.js - Repository para operaciones de Usuario
 */

import { BaseRepository } from './baseRepository.js';
import User from '../models/user.model.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error('❌ Error en findByEmail:', error);
      throw error;
    }
  }

  /**
   * Buscar usuario por email (sin lean para poder modificar)
   */
  async findByEmailWithDocument(email) {
    try {
      return await this.model.findOne({ email }).exec();
    } catch (error) {
      console.error('❌ Error en findByEmailWithDocument:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario con carrito populado
   */
  async findByIdWithCart(id) {
    try {
      return await this.model
        .findById(id)
        .populate('cart')
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en findByIdWithCart:', error);
      throw error;
    }
  }

  /**
   * Actualizar contraseña de usuario
   */
  async updatePassword(userId, hashedPassword) {
    try {
      return await this.update(userId, { password: hashedPassword });
    } catch (error) {
      console.error('❌ Error en updatePassword:', error);
      throw error;
    }
  }

  /**
   * Crear token de recuperación de contraseña
   */
  async setPasswordResetToken(userId, token, expiresAt) {
    try {
      return await this.model
        .findByIdAndUpdate(userId, {
          passwordResetToken: token,
          passwordResetExpires: expiresAt
        }, { new: true })
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en setPasswordResetToken:', error);
      throw error;
    }
  }

  /**
   * Verificar y limpiar token de recuperación
   */
  async verifyPasswordResetToken(token) {
    try {
      const user = await this.model
        .findOne({
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() }
        })
        .exec();

      return user;
    } catch (error) {
      console.error('❌ Error en verifyPasswordResetToken:', error);
      throw error;
    }
  }

  /**
   * Limpiar token de recuperación
   */
  async clearPasswordResetToken(userId) {
    try {
      return await this.update(userId, {
        passwordResetToken: null,
        passwordResetExpires: null
      });
    } catch (error) {
      console.error('❌ Error en clearPasswordResetToken:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios con filtros paginados
   */
  async findPaginated(filter = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const data = await this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const total = await this.count(filter);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error en findPaginated:', error);
      throw error;
    }
  }
}

export default new UserRepository();
