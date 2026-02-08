import Ticket from '../models/ticket.js';

/**
 * TicketDAO - Data Access Object para tickets
 * Responsabilidad: Acceso a base de datos para operaciones con tickets
 */

class TicketDAO {
  /**
   * Crear un nuevo ticket
   * @param {Object} ticketData - Datos del ticket
   * @returns {Promise<Object>} - Ticket creado
   */
  static async createTicket(ticketData) {
    try {
      const newTicket = new Ticket(ticketData);
      return await newTicket.save();
    } catch (error) {
      console.error('❌ Error en DAO - createTicket:', error);
      // Proporcionar detalles específicos del error de validación
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors)
          .map(err => `${err.path}: ${err.message}`)
          .join('; ');
        throw new Error(`Validación de ticket fallida: ${messages}`);
      }
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new Error('El código del ticket ya existe en la base de datos');
      }
      throw new Error(`Error al crear ticket: ${error.message}`);
    }
  }

  /**
   * Obtener ticket por código
   * @param {String} code - Código del ticket
   * @returns {Promise<Object>} - Ticket encontrado
   */
  static async getTicketByCode(code) {
    try {
      return await Ticket.findOne({ code }).populate('products.product unavailableProducts.product user');
    } catch (error) {
      console.error('❌ Error en DAO - getTicketByCode:', error);
      throw new Error('Error al obtener ticket de la base de datos');
    }
  }

  /**
   * Obtener tickets por usuario
   * @param {String} purchaser - Email del comprador
   * @returns {Promise<Array>} - Lista de tickets del usuario
   */
  static async getTicketsByPurchaser(purchaser) {
    try {
      return await Ticket.find({ purchaser }).sort({ purchase_datetime: -1 }).populate('products.product unavailableProducts.product user');
    } catch (error) {
      console.error('❌ Error en DAO - getTicketsByPurchaser:', error);
      throw new Error('Error al obtener tickets del usuario');
    }
  }

  /**
   * Obtener todos los tickets
   * @returns {Promise<Array>} - Lista de todos los tickets
   */
  static async getAllTickets() {
    try {
      return await Ticket.find().sort({ purchase_datetime: -1 }).populate('products.product unavailableProducts.product user');
    } catch (error) {
      console.error('❌ Error en DAO - getAllTickets:', error);
      throw new Error('Error al obtener tickets');
    }
  }

  /**
   * Contar tickets totales
   * @returns {Promise<Number>} - Total de tickets
   */
  static async countTickets() {
    try {
      return await Ticket.countDocuments();
    } catch (error) {
      console.error('❌ Error en DAO - countTickets:', error);
      throw new Error('Error al contar tickets');
    }
  }

  /**
   * Actualizar ticket
   * @param {String} id - ID del ticket
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Ticket actualizado
   */
  static async updateTicket(id, updateData) {
    try {
      return await Ticket.findByIdAndUpdate(id, updateData, { new: true }).populate('products.product unavailableProducts.product user');
    } catch (error) {
      console.error('❌ Error en DAO - updateTicket:', error);
      throw new Error('Error al actualizar ticket');
    }
  }
}

export default TicketDAO;
