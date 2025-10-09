const Customer = require("../models/Customer");

exports.addCustomer = async (req, res) => {
  try {
    const data = req.body;
    
    // Debug: Check what data is received
    console.log("Received data:", JSON.stringify(data, null, 2));
    
    // Convert all measurement values to numbers where applicable
    if (data.measurements) {
      console.log("Measurements before conversion:", data.measurements);
      
      // Create a new measurements object to avoid mutation issues
      const processedMeasurements = {};
      
      for (const key in data.measurements) {
        const value = data.measurements[key];
        
        // For numeric fields (all except description fields)
        if (key !== 'shirtDescription' && key !== 'pantDescription') {
          if (value === "" || value === null || value === undefined) {
            // For empty values in numeric fields, set to undefined (won't be stored)
            processedMeasurements[key] = undefined;
          } else {
            // Convert to number - if it's a valid number, use it, otherwise set to undefined
            const numValue = Number(value);
            processedMeasurements[key] = isNaN(numValue) ? undefined : numValue;
          }
        } else {
          // For description fields, keep as string but handle empty values
          processedMeasurements[key] = value === "" ? undefined : value;
        }
      }
      
      // Replace the measurements object with the processed one
      data.measurements = processedMeasurements;
      console.log("Measurements after conversion:", data.measurements);
    }

    const customer = await Customer.create(data);
    console.log("Saved customer:", customer);
    res.status(201).json(customer);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const data = req.body;
    
    console.log("Updating customer:", req.params.id);
    console.log("Update data:", JSON.stringify(data, null, 2));
    
    // Process measurements for update as well
    if (data.measurements) {
      const processedMeasurements = {};
      
      for (const key in data.measurements) {
        const value = data.measurements[key];
        
        if (key !== 'shirtDescription' && key !== 'pantDescription') {
          if (value === "" || value === null || value === undefined) {
            processedMeasurements[key] = undefined;
          } else {
            const numValue = Number(value);
            processedMeasurements[key] = isNaN(numValue) ? undefined : numValue;
          }
        } else {
          processedMeasurements[key] = value === "" ? undefined : value;
        }
      }
      
      data.measurements = processedMeasurements;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};