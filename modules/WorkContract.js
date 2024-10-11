const mongoose = require('mongoose'); // Erase if already required

var salaryStructure = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    value:{
        type:Number,
        required:true,
        index:true,
        default:0,
    },
    ActivityLog:[]
},{timestamps:true});

var Deductions = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    value:{
        type:Number,
        required:true,
        index:true,
        default:0,
    },
    ActivityLog:[]
},{timestamps:true});


// Declare the Schema of the Mongo model
var workContractSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    GradeLevel:String,
    category:String,
    Generationday:String,
    status:{
        type:Boolean,
        required:true,
        index:true,
        default:false,
        },
        autoGen:{
            type:Boolean,
            default:false,
        },
        salaryStructure:[salaryStructure],
        Deductions:[Deductions],
        Total:{
            type:Number,
            default:0,
        },
    
    ActivityLog:[]
},{timestamps:true});

//Export the model
const workContract = mongoose.model('workContract', workContractSchema);
module.exports = workContract