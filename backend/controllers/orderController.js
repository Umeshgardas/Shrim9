const Order = require('../models/Order');

exports.addOrder = async (req, res) => {
  const { customerId, clothType } = req.body;

  try {
    const order = await Order.create({ customerId, clothType });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
