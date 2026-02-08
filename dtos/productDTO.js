/**
 * ProductDTO.js - Data Transfer Objects para Producto
 */

export class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.description = product.description;
  }
}

export class ProductListDTO {
  constructor(product) {
    this.id = product._id;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
  }
}

export class ProductCreateDTO {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.stock = data.stock;
    this.category = data.category;
    this.description = data.description;
  }
}
