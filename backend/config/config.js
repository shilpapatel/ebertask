// check env.
var env = process.env.NODE_ENV || 'development';
// fetch env. config
var config = require('./config.json');
var envConfig = config[env];
// add env. config values to process.env
Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);

// const Settings = require('../model/settings.model');

// // Fetch settings data from the database or wherever it's stored
// module.exports = function (app) {
//   // Fetch settings data from the database or wherever it's stored
//   (async () => {
//     try {
//       const settings = await Settings.findOne({});
//       // Set the settings data globally
//       app.locals.settings = settings;
//       console.log('Settings data loaded:', settings);
//     } catch (err) {
//       console.error('Error fetching settings:', err);
//     }
//   })();
// };