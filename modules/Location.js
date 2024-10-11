
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var location = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
   
},{ timestamps: true });

//Export the model
const Location = mongoose.model('location', location);

module.exports = Location