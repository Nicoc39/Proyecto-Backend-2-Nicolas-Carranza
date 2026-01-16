import mongoose from 'mongoose';
import User from './models/user.model.js';
import { createHash } from './utils/hashUtils.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

async function createTestUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Conectado a MongoDB');

    // Verificar si ya existe
    const existingUser = await User.findOne({ email: 'juampi@test.com' });
    if (existingUser) {
      console.log('✓ Usuario ya existe');
      process.exit(0);
    }

    // Crear usuario
    const newUser = await User.create({
      first_name: 'Juampi',
      last_name: 'Colla',
      email: 'juampi@test.com',
      age: 25,
      password: createHash('12345'),
      role: 'user'
    });

    console.log('✓ Usuario creado:');
    console.log('  Email: juampi@test.com');
    console.log('  Password: 12345');
    console.log('\n✓ Ya puedes hacer login en http://localhost:8080/users/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
