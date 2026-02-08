import mongoose from 'mongoose';

const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    // Código único del ticket
    code: {
      type: String,
      unique: true,
      required: true,
      index: true
    },

    // Referencia al usuario que compró
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Productos comprados
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    // Productos no disponibles (stock insuficiente)
    unavailableProducts: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        name: String,
        requestedQuantity: Number,
        availableQuantity: Number,
        reason: String
      }
    ],

    // Monto total de la compra
    total: {
      type: Number,
      required: true,
      min: 0
    },

    // Estado del ticket
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled'],
      default: 'pending'
    },

    // Cantidad de productos completados
    quantity: {
      type: Number,
      required: true,
      default: 0
    },

    // Email del comprador (snapshot)
    purchaser: {
      type: String,
      required: true
    },

    // Fecha de compra
    purchase_datetime: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'tickets'
  }
);

// Índices para búsquedas rápidas
ticketSchema.index({ user: 1, purchase_datetime: -1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ purchaser: 1 });

// Pre-validate middleware para generar código único antes de validar
ticketSchema.pre('validate', function(next) {
  if (!this.code) {
    // Generar código único: TICKET-timestamp-random
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.code = `TICKET-${timestamp}-${random}`;
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
