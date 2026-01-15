const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller reference is required'],
    index: true // Index for efficient seller-based queries
  }
}, {
  timestamps: true
});

// Index for efficient product lookups by seller
productSchema.index({ seller: 1, name: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;