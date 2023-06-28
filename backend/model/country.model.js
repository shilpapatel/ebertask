const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  country: { type: String, required: true ,unique:true},
  timezone: { type: String, required: true },
  currency: { type: String, required: true },
  code: { type: String, required: true },
  flag: { type: String, required: true }
});
module.exports = mongoose.model('Country', countrySchema);