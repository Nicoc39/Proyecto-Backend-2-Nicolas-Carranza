import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

async function resetDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Conectado a MongoDB');

    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✓ Colección "${collection.name}" vaciada`);
    }

    console.log('✓ Base de datos reseteada completamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetDatabase();
