const mongoose = require('mongoose')
const { isEmail} = require('validator');


    var Email =new mongoose.Schema({
        Reciever:{
            type:String,
            required:[true,'please enter an Email'],
            lowercase:true,
            validate:[isEmail,'please enter a valid Email']
        }
    }
)
    mongoose.model ('emails',Email );


  var leadMeassage = new mongoose.Schema ( {  
    title:{
        type:String,
        required:true,
        lowercase:true,
    },
    header:{
        type:String,
        lowercase:true,
    },
    RecieptiantsEmails:[],
    message:{
        type:String,
        lowercase:true,
    },
    image:{
        type:String,
    },
    Body:String,
    Template:String,
    DateSent:String,
    SheduledDate:String,
    status:{
        type:String,
        default:"Pending",
    }
});  
const messages = mongoose.model ('email', leadMeassage);


 module.exports = messages;