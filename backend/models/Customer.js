const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    measurements: {
      length: Number,
      nehru: Number,
      chest: Number,
      stomach: Number,
      seat: Number,
      front: Number,
      frontWidth: Number,
      frontDepth: Number,
      shoulder: Number,
      biceps: Number,
      handLength: Number,
      cuff: Number,
      cuffLength: Number,
      collar: Number,
      stand: Number,
      shirtDescription: String,
      
      // Pant measurements
      pantLength: Number,
      pantSeat: Number,
      kadda: Number,
      pantWaist: Number,
      thies: Number,
      knees: Number,
      cafs: Number,
      bottom: Number,
      pantDescription: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);