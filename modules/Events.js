const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var EventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        index:true,
    },
    type:{
        type:Boolean,
        required:true,
        default:false,
        index:true,
        lowercase:true,
    },
    startdate:{
        type:String,
        required:true,
    }, 
    enddate:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    ActivityLog:[],
    status:{
        type:String,
        default:'pending',
        required:true
    }
});

//Export the model
const Event = mongoose.model('Event', EventSchema);
module.exports = Event;