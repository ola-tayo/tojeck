
const mongoose = require('mongoose'); // Erase if already required
var moment = require("moment");


// Declare the Schema of the Mongo model
var BeamCardSchema = new mongoose.Schema({
    WHID:{
        type:mongoose.Types.ObjectId,
        ref:'wareHouses',
        required:true,
    },
    RasisedBy:{
        type:mongoose.Types.ObjectId,
        ref:'Employees',
        required:true,
    },
    date:{ 
        type: String,
        required: true,
        default: moment().format('YYYY-MM-DD'),
    },
    Storekeeper: {
        type:String,
        required:true,
    },
    product:[],
    Status:{ type:String,
         required:true,
        default:"Pending"
     },
    comment:{ type:String,}
   
},{ timestamps: true });

//Export the model
const BeamCard = mongoose.model('BeamCard', BeamCardSchema);

module.exports = BeamCard



// WHID:Whid,
// RasisedBy:ActiveUser,
// date: moment().format('YYYY-MM-DD'),
// Storekeeper:ActiveUserName,
// product:[],
// Status:"Pending"