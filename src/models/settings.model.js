import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true,
    },
    tiktok: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
  },
  payment: {
    stripeSecretKey: {
      type: String,
      required: true,
    },
    stripePublishableKey: {
      type: String,
      required: true,
    },
    paypalClientId: {
      type: String,
      required: true,
    },
    paypalSecret: {
      type: String,
      required: true,
    },
  },
  mongoDBConnection: {
    type: String,
    required: true,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;