/**
 * BaseRepository.js - Clase base para todos los repositorios
 * Responsabilidad: Proporcionar métodos comunes CRUD
 */

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Obtener todos los documentos
   */
  async findAll(filter = {}, projection = null, options = {}) {
    try {
      return await this.model
        .find(filter, projection)
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en findAll:', error);
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }
  }

  /**
   * Obtener un documento por ID
   */
  async findById(id, projection = null) {
    try {
      return await this.model
        .findById(id, projection)
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en findById:', error);
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  /**
   * Obtener un documento con criterio
   */
  async findOne(filter = {}, projection = null) {
    try {
      return await this.model
        .findOne(filter, projection)
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en findOne:', error);
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  /**
   * Contar documentos
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      console.error('❌ Error en count:', error);
      throw new Error(`Error al contar documentos: ${error.message}`);
    }
  }

  /**
   * Crear un documento
   */
  async create(data) {
    try {
      const doc = new this.model(data);
      return await doc.save();
    } catch (error) {
      console.error('❌ Error en create:', error);
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  /**
   * Actualizar un documento
   */
  async update(id, data) {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, { new: true })
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }

  /**
   * Eliminar un documento
   */
  async delete(id) {
    try {
      return await this.model
        .findByIdAndDelete(id)
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error en delete:', error);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  /**
   * Eliminar múltiples documentos
   */
  async deleteMany(filter = {}) {
    try {
      return await this.model.deleteMany(filter).exec();
    } catch (error) {
      console.error('❌ Error en deleteMany:', error);
      throw new Error(`Error al eliminar documentos: ${error.message}`);
    }
  }

  /**
   * Insertar múltiples documentos
   */
  async insertMany(data) {
    try {
      return await this.model.insertMany(data);
    } catch (error) {
      console.error('❌ Error en insertMany:', error);
      throw new Error(`Error al insertar documentos: ${error.message}`);
    }
  }
}
