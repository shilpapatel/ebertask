const mongoose = require('mongoose')
const Schema = mongoose.Schema

let vehicletypeSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    vehicletype: {
      type: String,
      unique:[true,'Vehicle Type Already Exists']
    },
    vehicleimg: {
      type: String,
    },
  },
)

const VehicleType= mongoose.model('VehicleType', vehicletypeSchema)

module.exports = VehicleType;
 
