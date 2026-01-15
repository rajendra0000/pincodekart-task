const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    index: true // Index for fast lookup by pincode
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
sellerSchema.index({ pincode: 1, category: 1 });

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;