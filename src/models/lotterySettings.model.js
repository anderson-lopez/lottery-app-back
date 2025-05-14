import mongoose from 'mongoose';

const lotterySettingsSchema = new mongoose.Schema({
  name: String,
  prize: String,
  pricePerNumber: Number,
  imageUrl: String,
  endDate: Date,
}, { timestamps: true });

export default mongoose.model('LotterySettings', lotterySettingsSchema);