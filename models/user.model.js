import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: function() {
      // Password no es requerido si el usuario se registró con GitHub
      return !this.githubId;
    }
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true // Permite valores null sin violar la restricción unique
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;