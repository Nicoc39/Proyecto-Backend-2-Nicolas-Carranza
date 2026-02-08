import PurchaseService from '../services/purchaseService.js';
import AuthorizationService from '../services/authorizationService.js';

/**
 * PurchaseController - Controlador para procesamiento de compras
 * Responsabilidad: Manejar requests/responses de compras
 */

class PurchaseController {
  /**
   * Procesar compra del carrito
   */
  static async processPurchase(req, res) {
    try {
      const userId = req.user.id || req.user._id;

      // Validar autorización
      const auth = AuthorizationService.validatePermission(req.user, 'purchase');
      if (!auth.authorized) {
        return res.status(403).json({
          status: 'error',
          message: auth.message
        });
      }

      console.log('💳 Procesando compra para usuario:', userId);

      // Obtener carrito del usuario
      const cartItems = req.body.products || [];

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Carrito vacío'
        });
      }

      // Procesar compra
      const result = await PurchaseService.processPurchase(userId, cartItems);

      res.json({
        status: 'success',
        message: result.message,
        ticket: {
          code: result.ticket.code,
          id: result.ticket._id,
          total: result.ticket.total,
          status: result.ticket.status,
          processedItems: result.processedCount,
          unavailableItems: result.unavailableCount
        }
      });
    } catch (error) {
      console.error('❌ Error en processPurchase:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al procesar compra'
      });
    }
  }

  /**
   * Obtener historial de compras del usuario
   */
  static async getUserTickets(req, res) {
    try {
      const userId = req.user.id || req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      console.log('📋 Obteniendo tickets del usuario:', userId);

      const result = await PurchaseService.getUserPurchaseHistory(userId, page, limit);

      res.json({
        status: 'success',
        tickets: result.tickets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Error en getUserTickets:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener historial de compras'
      });
    }
  }

  /**
   * Obtener un ticket específico
   */
  static async getTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const userId = req.user.id || req.user._id;

      console.log('🎟️ Obteniendo ticket:', ticketId);

      const ticket = await PurchaseService.getTicketById(ticketId, userId);

      res.json({
        status: 'success',
        ticket
      });
    } catch (error) {
      console.error('❌ Error en getTicket:', error);
      res.status(error.message.includes('No autorizado') ? 403 : 500).json({
        status: 'error',
        message: error.message || 'Error al obtener ticket'
      });
    }
  }

  /**
   * Obtener un ticket por codigo
   */
  static async getTicketByCode(req, res) {
    try {
      const { code } = req.params;
      const userId = req.user.id || req.user._id;

      const ticket = await PurchaseService.getTicketByCode(code);

      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket no encontrado'
        });
      }

      if (req.user.role !== 'admin') {
        const ticketUserId = ticket.user?._id?.toString() || ticket.user?.toString();
        if (ticketUserId && ticketUserId !== userId.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'No autorizado para acceder a este ticket'
          });
        }
      }

      res.json({
        status: 'success',
        ticket
      });
    } catch (error) {
      console.error('❌ Error en getTicketByCode:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener ticket'
      });
    }
  }

  /**
   * Obtener todos los tickets (solo admin)
   */
  static async getAllTickets(req, res) {
    try {
      // Validar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Solo administradores pueden acceder a esta información'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      console.log('📊 Obteniendo todos los tickets (admin)');

      const result = await PurchaseService.getAllTickets(page, limit);

      res.json({
        status: 'success',
        tickets: result.tickets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Error en getAllTickets:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener tickets'
      });
    }
  }

  /**
   * Obtener estadísticas de ventas (solo admin)
   */
  static async getSalesStats(req, res) {
    try {
      // Validar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Solo administradores pueden acceder a esta información'
        });
      }

      console.log('📈 Obteniendo estadísticas de ventas');

      const stats = await PurchaseService.getSalesStatistics();

      res.json({
        status: 'success',
        statistics: stats
      });
    } catch (error) {
      console.error('❌ Error en getSalesStats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener estadísticas'
      });
    }
  }
}

export default PurchaseController;
