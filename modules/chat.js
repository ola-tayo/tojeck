const mongoose = require('mongoose');
const { isEmail} = require('validator');

const Messages = new mongoose.Schema({
    senderId: {
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
        required:true,
    },
    messageBody:String,
    time:String,
    status:{
        type:String,
        default:"unread"
    }
})

const chatShema = new  mongoose.Schema({
    sender: {
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
        required:true,
    },
    recevier:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES',
        required:true,
    },
    conversation:[Messages],
    status:{
        type:String
    }
});

const  chat = mongoose.model(' Conversation',chatShema);

module.exports = chat;