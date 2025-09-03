const Customer = require('../models/Customer');

exports.addCustomer = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const customer = await Customer.create({ name, phone });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
