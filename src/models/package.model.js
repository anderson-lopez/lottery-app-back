import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  isPopular: { type: Boolean, default: false }
});

export default mongoose.model('Package', packageSchema);