import { Router } from 'express';
import PurchaseController from '../controllers/purchaseController.js';
import { requireJWT, adminOnlyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Rutas de Compra y Tickets
 * Patrón: /api/purchases
 */

// Procesar compra
router.post('/process', requireJWT, (req, res, next) => {
	if (Array.isArray(req.body.items) && !req.body.products) {
		req.body.products = req.body.items.map(item => ({
			product: item.product_id || item.product,
			quantity: item.quantity
		}));
	}
	next();
}, PurchaseController.processPurchase);

// Obtener historial de compras del usuario autenticado
router.get('/my-tickets', requireJWT, PurchaseController.getUserTickets);

// Obtener un ticket específico del usuario
router.get('/ticket/:ticketId', requireJWT, PurchaseController.getTicket);

// Obtener un ticket por codigo
router.get('/ticket/code/:code', requireJWT, PurchaseController.getTicketByCode);

// Obtener todos los tickets (solo admin)
router.get('/admin/all-tickets', ...adminOnlyJWT, PurchaseController.getAllTickets);

// Obtener estadísticas de ventas (solo admin)
router.get('/admin/statistics', ...adminOnlyJWT, PurchaseController.getSalesStats);

export default router;
