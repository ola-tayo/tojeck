const mongoose = require('mongoose');
const { isEmail} = require('validator');
const { v4: uuidv4 } = require('uuid');
var moment = require("moment");


const Messages = new mongoose.Schema({
    senderId: {
        type:String,
    },
    author:String,
    messageBody:String,
    Timestamp:{
        type:String,
        default: moment().format('YYYY-MM-DD HH:mm:ss'),
        required:true,
    },
},{timestamps:true})




const HelpdeskSchema = new  mongoose.Schema({
    name:{
        type : String,
        required:true,
        lowercase:true
    },
    tel:{
        type:String,
        required:[true,'please enter a phone number'],
    },
    email:{
        type:String,
        lowercase:true,
        validate:[isEmail,'please enter a valid Email'],
        required:[true,'please enter an Email'],
    },
    Issue:{
        type:String,
    },
    Priority:{
        type: String,
        default: 'Low',
    },
    ActivityLog:[],
    date:{
        type:String,
        default: moment().format('YYYY-MM-DD'),
        required:true,
    },
    conversation:[Messages],
    TicketId:{
        type:String,
        default:`Ticket-${Math.floor(Math.random() * 238948)}`,
        required:true,
        unique:true,
    },
    status:{
        type:String,
        default:"Open"
    },
    internalUnitId:{
        type:String,
        default:"",
    }

},{timestamps:true});

const  Helpdesk = mongoose.model(' Helpdesk',HelpdeskSchema);

module.exports = Helpdesk;