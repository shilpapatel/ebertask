const mongoose = require('mongoose');
// require('./admin.model');

mongoose.connect('mongodb://127.0.0.1:27017/TaskMeanStackDb').then(()=>{
  console.log("connection successful")
}).catch(()=>{
  console.log("no connection");
})
