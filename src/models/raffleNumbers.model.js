import mongoose from 'mongoose';

const raffleNumberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true }, // Ej: "00001"
  status: { type: String, enum: ['available', 'assigned'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  prizeAmount: { type: Number }, // Si tiene premio instantáneo
  delivered: { type: Boolean, default: false }
});

export default mongoose.models.RaffleNumber || mongoose.model('RaffleNumber', raffleNumberSchema);