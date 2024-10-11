const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var TimeoffSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    EmployeeId:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
        required:true,
    },
    status:{
        default:'Pending',
        type:String,
    },
    StartDate:{
        type:String,
        required:true,
    },
    EndDate:{
        type:String,
        required:true,
    },
    Attachement:String,
    Type:String,
    Description:{
        type:String,
        required:true,
    },
    category:String,
    EmployeeName:String,
    ActivityLog:[]
},{timestamps:true});

//Export the model
const Timeoff = mongoose.model('Timeoff', TimeoffSchema);
module.exports = Timeoff