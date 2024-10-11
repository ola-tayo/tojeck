
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var kpi = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
   
},{ timestamps: true });

//Export the model
const kpis = mongoose.model('kpi', kpi);

module.exports = kpis