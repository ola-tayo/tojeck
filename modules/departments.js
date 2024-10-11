
const mongoose = require('mongoose');
const { isEmail} = require('validator');

const DepartmentSchema = new mongoose.Schema({
    Name:String,
    HOD:{
        type:mongoose.Types.ObjectId,
        ref:'Employee',
        required:true,
    }

},{timestamps:true});

const  Department = mongoose.model(' Department',DepartmentSchema);


const jobTittleSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        unique:true,
    },

},{timestamps:true});

const  jobTittle = mongoose.model(' jobTittle',jobTittleSchema);

module.exports = {
    jobTittle,
    Department
}