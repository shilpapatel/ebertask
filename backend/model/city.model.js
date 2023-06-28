const mongoose = require('mongoose');
const { Schema } = mongoose;

const citySchema = new mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  // country: { type: String, required: true }
  country_id:{type: Schema.Types.ObjectId,required:true},
  city: { type: String, required: true,unique:true },
  coordinates:[{
    type:Object,
    required:true
}] ,
});

module.exports = mongoose.model('City', citySchema);