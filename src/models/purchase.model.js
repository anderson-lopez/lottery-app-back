import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  buyer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    confirmEmail: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    province: { type: String },
    city: { type: String, required: true },
    address: { type: String, required: true },
    acceptedTerms: { type: Boolean, required: true }
  },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  assignedNumbers: [{ type: String }], // Array de números asignados (ej: ["00001", "00002"])

  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_transfer', 'card'],
    required: true
  },

  paypal: {
    orderId: String,
    payerId: String,
    paymentId: String,
    status: String,
    amount: Number,
    currency: String,
    completedAt: Date,
  },

  bankTransfer: {
    bankName: String,
    referenceCode: String,
    received: { type: Boolean, default: false },
    confirmedAt: Date,
  },

  card: {
    paymentProvider: { type: String }, // "payphone", "stripe", etc.
    transactionId: String,
    status: String,
    cardBrand: String, // solo si aplica (Stripe, etc.)
    last4: String,     // solo si aplica (Stripe, etc.)
    completedAt: Date,
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
