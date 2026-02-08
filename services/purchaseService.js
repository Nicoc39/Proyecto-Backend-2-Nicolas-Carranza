/**
 * PurchaseService.js - Servicio de lógica de compra
 * Responsabilidad: Manejar la lógica compleja de procesamiento de compras
 */

import Ticket from '../models/ticket.js';
import ProductRepository from '../repositories/productRepository.js';
import UserRepository from '../repositories/userRepository.js';
import EmailService from './emailService.js';
import CartDAO from '../daos/cartDAO.js';
import TicketDAO from '../daos/ticketDAO.js';

class PurchaseService {
  /**
   * Procesar una compra completa
   * @param {String} userId - ID del usuario
   * @param {Array} cartProducts - Productos del carrito
   * @returns {Object} - Ticket procesado
   */
  static async processPurchase(userId, cartProducts) {
    try {
      // 1. Validar que el usuario exista
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

        // Validar que el usuario tenga email
        if (!user.email) {
          throw new Error('El usuario no tiene un email asociado');
        }
      // 2. Procesar productos: verificar stock y separar disponibles
      const processedProducts = [];
      const unavailableProducts = [];
      let total = 0;
      let quantity = 0;

      for (const item of cartProducts) {
        const product = await ProductRepository.findById(item.product);

        if (!product) {
          unavailableProducts.push({
            product: item.product,
            name: 'Producto desconocido',
            requestedQuantity: item.quantity,
            availableQuantity: 0,
            reason: 'Producto no encontrado'
          });
          continue;
        }

        // Verificar stock
        if (product.stock < item.quantity) {
          unavailableProducts.push({
            product: product._id,
            name: product.name,
            requestedQuantity: item.quantity,
            availableQuantity: product.stock,
            reason: 'Stock insuficiente'
          });

          // Si hay stock disponible, ofrecer venta parcial
          if (product.stock > 0) {
            processedProducts.push({
              product: product._id,
              name: product.name,
              price: product.price,
              quantity: product.stock
            });
            total += product.price * product.stock;
            quantity += product.stock;

            // Actualizar stock
            await ProductRepository.updateStock(product._id, product.stock);
          }
        } else {
          // Producto disponible - agregar a la compra
          processedProducts.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity
          });
          total += product.price * item.quantity;
          quantity += item.quantity;

          // Actualizar stock
          await ProductRepository.updateStock(product._id, item.quantity);
        }
      }

      // 3. Crear ticket
      // 3. Crear ticket usando DAO
      const ticketData = {
        user: userId,
        products: processedProducts,
        unavailableProducts,
        total,
        quantity,
        purchaser: user.email,
        status: processedProducts.length > 0 ? 'completed' : 'cancelled'
      };

      const ticket = await TicketDAO.createTicket(ticketData);

      // 4. Vaciar carrito si hay compra completada
      if (processedProducts.length > 0) {
        await CartDAO.clearCart(userId);
      }

      // 5. Enviar email de confirmación
      try {
        await EmailService.sendOrderConfirmationEmail(
          user.email,
          `${user.first_name} ${user.last_name}`,
          ticket
        );
      } catch (emailError) {
        console.error('Error enviando email de confirmación:', emailError);
        // No interrumpir el proceso si falla el email
      }

      return {
        success: true,
        ticket,
        status: ticket.status,
        processedCount: processedProducts.length,
        unavailableCount: unavailableProducts.length,
        message: ticket.status === 'completed'
          ? 'Compra procesada exitosamente'
          : 'Compra cancelada - no hay productos disponibles'
      };
    } catch (error) {
      console.error('❌ Error en processPurchase:', error);
      throw new Error(`Error procesando compra: ${error.message}`);
    }
  }

  /**
   * Obtener historial de compras del usuario
   */
  static async getUserPurchaseHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const tickets = await Ticket
        .find({ user: userId })
        .sort({ purchase_datetime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('products.product', 'name price')
        .lean();

      const total = await Ticket.countDocuments({ user: userId });

      return {
        tickets,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error en getUserPurchaseHistory:', error);
      throw error;
    }
  }

  /**
   * Obtener un ticket específico
   */
  static async getTicketById(ticketId, userId) {
    try {
      const ticket = await Ticket
        .findById(ticketId)
        .populate('user', 'first_name last_name email')
        .populate('products.product');

      // Validar que el ticket pertenezca al usuario (o ser admin)
      if (ticket.user._id.toString() !== userId) {
        throw new Error('No autorizado para acceder a este ticket');
      }

      return ticket;
    } catch (error) {
      console.error('❌ Error en getTicketById:', error);
      throw error;
    }
  }

  /**
   * Obtener un ticket por codigo
   */
  static async getTicketByCode(code) {
    try {
      return await TicketDAO.getTicketByCode(code);
    } catch (error) {
      console.error('❌ Error en getTicketByCode:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tickets (solo admin)
   */
  static async getAllTickets(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const tickets = await Ticket
        .find()
        .sort({ purchase_datetime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'first_name last_name email')
        .lean();

      const total = await Ticket.countDocuments();

      return {
        tickets,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error en getAllTickets:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ventas (solo admin)
   */
  static async getSalesStatistics() {
    try {
      const totalSales = await Ticket.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalTickets: { $sum: 1 },
            totalItems: { $sum: '$quantity' },
            completedSales: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        }
      ]);

      const topProducts = await Ticket.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.product',
            totalSold: { $sum: '$products.quantity' },
            totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        }
      ]);

      return {
        salesSummary: totalSales[0] || {
          totalRevenue: 0,
          totalTickets: 0,
          totalItems: 0,
          completedSales: 0
        },
        topProducts
      };
    } catch (error) {
      console.error('❌ Error en getSalesStatistics:', error);
      throw error;
    }
  }
}

export default PurchaseService;
