const mongoose = require('mongoose')
// const Schema = mongoose.Schema

let settingsSchema = new mongoose.Schema(
  {
    requesttime: {
      type: String,
      default: '10'
    },
    maxstops: {
      type: String,
      default: '1'
    },
  },
)

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
