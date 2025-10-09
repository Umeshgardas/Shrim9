const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String }, 
  garmentType: { type: String, required: true },
  fabric: { type: String },
  color: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  advancePayment: { type: Number, default: 0 },
  deliveryDate: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  specialInstructions: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);