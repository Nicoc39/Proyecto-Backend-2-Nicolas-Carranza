/**
 * EmailService.js - Servicio de envío de emails
 * Responsabilidad: Manejar envío de emails del sistema
 */

import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    // Configurar transportador de emails
    // Aquí puedes usar Gmail, SendGrid, Mailgun, etc.
    // Para desarrollo, se recomienda usar Mailtrap o similar
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });

    // Verificar conexión
    this.verifyTransporter();
  }

  /**
   * Verificar que el transportador esté configurado correctamente
   */
  verifyTransporter() {
    if (config.smtp.user && config.smtp.pass) {
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn({ err: error }, 'Email service not properly configured');
        } else {
          logger.info('Email service ready');
        }
      });
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(to, subject, htmlContent) {
    try {
      // Si no hay configuración de SMTP, simular envío
      if (!config.smtp.user) {
        logger.info({ to, subject }, 'Email simulado');
        return { success: true, simulated: true };
      }

      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info({ messageId: info.messageId, to }, 'Email enviado');
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ err: error }, 'Error enviando email');
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(userEmail, resetToken, userName) {
    try {
      const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <h2>Recuperación de Contraseña</h2>
        <p>Hola ${userName},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
        
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 30px;
          background-color: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
        ">
          Restablecer Contraseña
        </a>
        
        <p>O copia y pega este enlace en tu navegador:</p>
        <p>${resetUrl}</p>
        
        <p><strong>Este enlace expirará en 1 hora.</strong></p>
        
        <p>Si no solicitaste restablecer tu contraseña, ignora este email.</p>
        
        <hr>
        <p>© 2026 Ecommerce. Todos los derechos reservados.</p>
      `;

      return await this.sendEmail(
        userEmail,
        'Recupera tu contraseña - Ecommerce',
        htmlContent
      );
    } catch (error) {
      console.error('❌ Error en sendPasswordResetEmail:', error);
      throw error;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const htmlContent = `
        <h2>¡Bienvenido a Nuestro Ecommerce!</h2>
        <p>Hola ${userName},</p>
        <p>Gracias por registrarte en nuestra plataforma. Ahora puedes:</p>
        
        <ul>
          <li>Explorar nuestro catálogo de productos</li>
          <li>Agregar productos a tu carrito</li>
          <li>Realizar compras de forma segura</li>
          <li>Gestionar tu perfil</li>
        </ul>
        
        <p><a href="${config.frontendUrl}/products">
          Comenzar a comprar
        </a></p>
        
        <hr>
        <p>Si tienes preguntas, contáctanos.</p>
        <p>© 2026 Ecommerce. Todos los derechos reservados.</p>
      `;

      return await this.sendEmail(
        userEmail,
        '¡Bienvenido a Ecommerce!',
        htmlContent
      );
    } catch (error) {
      console.error('❌ Error en sendWelcomeEmail:', error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de compra
   */
  async sendOrderConfirmationEmail(userEmail, userName, ticket) {
    try {
      const productsHtml = ticket.products
        .map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>$${p.price}</td>
            <td>$${p.quantity * p.price}</td>
          </tr>
        `)
        .join('');

      const htmlContent = `
        <h2>Confirmación de Compra</h2>
        <p>Hola ${userName},</p>
        <p>Tu compra ha sido procesada exitosamente.</p>
        
        <h3>Número de Ticket: ${ticket._id}</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Producto</th>
              <th style="padding: 10px; text-align: left;">Cantidad</th>
              <th style="padding: 10px; text-align: left;">Precio</th>
              <th style="padding: 10px; text-align: left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>
        
        <h3 style="text-align: right;">Total: $${ticket.total}</h3>
        
        <p>Estado: ${ticket.status}</p>
        <p>Fecha: ${new Date(ticket.purchase_datetime).toLocaleString('es-AR')}</p>
        
        <hr>
        <p>Gracias por tu compra.</p>
        <p>© 2026 Ecommerce. Todos los derechos reservados.</p>
      `;

      return await this.sendEmail(
        userEmail,
        `Confirmación de Compra - Ticket #${ticket._id}`,
        htmlContent
      );
    } catch (error) {
      console.error('❌ Error en sendOrderConfirmationEmail:', error);
      throw error;
    }
  }
}

export default new EmailService();
