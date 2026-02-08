/**
 * ProductRepository.js - Repository para operaciones de Producto
 */

import { BaseRepository } from './baseRepository.js';
import Product from '../models/product.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Buscar productos por categoría
   */
  async findByCategory(category) {
    try {
      return await this.findAll({ category });
    } catch (error) {
      console.error('❌ Error en findByCategory:', error);
      throw error;
    }
  }

  /**
   * Buscar productos con stock disponible
   */
  async findAvailable() {
    try {
      return await this.findAll({ stock: { $gt: 0 } });
    } catch (error) {
      console.error('❌ Error en findAvailable:', error);
      throw error;
    }
  }

  /**
   * Buscar productos por rango de precio
   */
  async findByPriceRange(minPrice, maxPrice) {
    try {
      return await this.findAll({
        price: { $gte: minPrice, $lte: maxPrice }
      });
    } catch (error) {
      console.error('❌ Error en findByPriceRange:', error);
      throw error;
    }
  }

  /**
   * Actualizar stock de producto
   */
  async updateStock(productId, quantity) {
    try {
      return await this.model
        .findByIdAndUpdate(
          productId,
          { $inc: { stock: -quantity } },
          { new: true }
        )
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en updateStock:', error);
      throw error;
    }
  }

  /**
   * Obtener productos con paginación
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

export default new ProductRepository();
