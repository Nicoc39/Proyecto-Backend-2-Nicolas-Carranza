/**
 * AuthorizationService.js - Servicio de autorización de negocio
 * Responsabilidad: Validar permisos para operaciones específicas
 */

class AuthorizationService {
  /**
   * Verificar si el usuario es administrador
   */
  static isAdmin(user) {
    if (!user) return false;
    return user.role === 'admin';
  }

  /**
   * Verificar si el usuario puede crear productos
   */
  static canCreateProduct(user) {
    return this.isAdmin(user);
  }

  /**
   * Verificar si el usuario puede actualizar productos
   */
  static canUpdateProduct(user) {
    return this.isAdmin(user);
  }

  /**
   * Verificar si el usuario puede eliminar productos
   */
  static canDeleteProduct(user) {
    return this.isAdmin(user);
  }

  /**
   * Verificar si el usuario puede agregar productos al carrito
   */
  static canAddToCart(user) {
    return user && user.id;
  }

  /**
   * Verificar si el usuario puede hacer compra
   */
  static canPurchase(user) {
    return user && user.id;
  }

  /**
   * Verificar si el usuario puede ver su carrito
   */
  static canViewCart(user, cartOwnerId) {
    if (!user) return false;
    // El usuario puede ver su propio carrito o si es admin
    return user.id === cartOwnerId || this.isAdmin(user);
  }

  /**
   * Verificar si el usuario puede ver su perfil
   */
  static canViewProfile(user, profileOwnerId) {
    if (!user) return false;
    // El usuario puede ver su propio perfil o si es admin
    return user.id === profileOwnerId || this.isAdmin(user);
  }

  /**
   * Verificar si el usuario puede actualizar su perfil
   */
  static canUpdateProfile(user, profileOwnerId) {
    if (!user) return false;
    // El usuario puede actualizar su propio perfil o si es admin
    return user.id === profileOwnerId || this.isAdmin(user);
  }

  /**
   * Validar permisos con mensaje de error
   */
  static validatePermission(user, permission, resources = null) {
    const permissions = {
      'create-product': () => this.canCreateProduct(user),
      'update-product': () => this.canUpdateProduct(user),
      'delete-product': () => this.canDeleteProduct(user),
      'add-to-cart': () => this.canAddToCart(user),
      'view-cart': () => this.canViewCart(user, resources?.cartOwnerId),
      'purchase': () => this.canPurchase(user),
      'view-profile': () => this.canViewProfile(user, resources?.userId),
      'update-profile': () => this.canUpdateProfile(user, resources?.userId)
    };

    const isAuthorized = permissions[permission]?.();

    return {
      authorized: isAuthorized || false,
      message: isAuthorized
        ? 'Autorizado'
        : `No tienes permiso para: ${permission}`
    };
  }
}

export default AuthorizationService;
