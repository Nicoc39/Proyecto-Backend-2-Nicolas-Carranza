/**
 * UserDTO.js - Data Transfer Objects para Usuario
 * Responsabilidad: Transportar solo información necesaria y no sensible
 */

/**
 * DTO para usuario autenticado (sin datos sensibles)
 */
export class UserAuthDTO {
  constructor(user) {
    this.id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
  }
}

/**
 * DTO para usuario público (mínimo de información)
 */
export class UserPublicDTO {
  constructor(user) {
    this.id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
  }
}

/**
 * DTO para perfil de usuario (información sin contraseña)
 */
export class UserProfileDTO {
  constructor(user) {
    this.id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}

/**
 * DTO para registro de usuario
 */
export class UserRegisterDTO {
  constructor(data) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.age = data.age;
  }
}

/**
 * DTO para actualización de usuario
 */
export class UserUpdateDTO {
  constructor(data) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.age = data.age;
  }
}
