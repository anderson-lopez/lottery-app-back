import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'reseller'], default: 'admin' },
  code: { type: String, unique: true } // ej: "AB123"
});

export default mongoose.model('Admin', adminSchema);
