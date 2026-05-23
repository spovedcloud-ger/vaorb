const { dbRepo } = require('../config/db');

exports.getPricing = async (req, res) => {
  try {
    const pricing = await dbRepo.getPricing();
    res.json(pricing);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ message: 'Error retrieving pricing rates' });
  }
};

exports.updatePricing = async (req, res) => {
  const { planType } = req.params;
  const { price, title, titleSub, details, rateText } = req.body;

  if (price === undefined || isNaN(price)) {
    return res.status(400).json({ message: 'Valid price numeric value is required' });
  }

  try {
    const updates = {};
    if (price !== undefined) updates.price = Number(price);
    if (title !== undefined) updates.title = title;
    if (titleSub !== undefined) updates.titleSub = titleSub;
    if (details !== undefined) updates.details = details;
    if (rateText !== undefined) updates.rateText = rateText;

    const updated = await dbRepo.updatePricing(planType, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ message: 'Error updating pricing rates' });
  }
};
