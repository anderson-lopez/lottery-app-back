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
  quantity: { type: Number, required: true }, // número de boletos comprados
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_transfer', 'card'],
    required: true
  },

  // Detalles según el método de pago
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
    bankName: String, // por si lo necesitas
    referenceCode: String, // ej: Speed57-6223
    received: { type: Boolean, default: false }, // confirmación manual
    confirmedAt: Date,
  },

  card: {
    // Se puede completar con detalles si usas Stripe o algún gateway
    transactionId: String,
    status: String,
    cardBrand: String,
    last4: String,
    completedAt: Date,
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
