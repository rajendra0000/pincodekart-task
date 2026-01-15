const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  customerAddress: {
    type: String,
    required: [true, 'Customer address is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    index: true // Index for fast lookup by pincode
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient order queries by pincode and status
orderSchema.index({ pincode: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;