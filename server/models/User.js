const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  storeName: {
    type: String,
    validate: {
      validator: function (v) {
        return this.role !== 'admin' || !!v; // required if role is admin
      },
      message: 'Store name is required for admin users.',
    },
  },
  address: {
    type: String,
    validate: {
      validator: function (v) {
        return this.role !== 'admin' || !!v; // required if role is admin
      },
      message: 'Address is required for admin users.',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff',
    required: true,
  },
  storeOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
