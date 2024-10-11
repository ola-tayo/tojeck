const mongoose = require('mongoose');
const { isEmail} = require('validator');
const { Decimal128 } = require("mongodb");

// route days
const daySchema = new mongoose.Schema({
    date:{
        type:String, 
    },
},{timestamps:true})


const RetailCustomerSchema = new mongoose.Schema({
    name:{
        type : String,
        required:[true,'This field cannot be empty'],
        lowercase:true
    },
    Balance:{
        type: Decimal128,
        default: 0
    },
    Notification:{
        type:Array,
    },
    purchased:{
        type:Array,
    },
    phone:{
        type:String,
        required:[true,'please provide us Your phone Number'],
        unique:[true,"This Phone Number is already registered to a user"]
    },
    Email:{
        type:String,
        // required:[true,'please entert an Email'],
        // unique:true,
        lowercase:true,
        // validate:[isEmail,'please enter a valid Email']
    },
    registrationDate:{
        type:String,
    },
    country:{
        type:String,
        required:false
    },
    state:{
        type:String,
        required:false
    },
    street:{
        type:String,
        required:false
    },
    Land_mark:{
        type:String,
        required:false
    },
    NewsFeedSubscription:{
        type: Boolean,
        default: false
    },
    Image:{
        type:String,
    },
    creditLimit:{
        type:Number,
        default:0,  
        required:true,
    },
    blocked:{
        type:Boolean,
        default:true
    },
    salesPerson:{
        type:mongoose.Types.ObjectId,
        ref:'EMPLOYEES'
    },
    lastPayDate:{
        type:String,
        default:''
    },
    Type:{
        type:String,
        required:[true,'Please specify customer Type'],
        enum:['Retail']
    },
    shopName:{
        type:String,
    },
    GeoLoacionLat:{
        type:String,
        default:''
    },
    GeoLoacionLong:{
        type:String,
        default:''
    },
    RouteDays:[daySchema],
    googleMapDirection:{
        type:String,
    },
    SupplyVan:{
        type:mongoose.Types.ObjectId,
        ref:'Van'
    },
    remarks:{
        type:String,
        default:''
    },
    customerCode:{
        type:String,
        default:'',
        unique:true
    },
    Birthday:{
        type:String,
        default:'',
    },

},{timestamps:true});


// save hashed password before updating to db
// CustomerSchema.pre('save', async function(doc,next){
//     const salt = await bcrypt.genSalt();
//     this.Password =  await bcrypt.hash(this.Password,salt)
//     next();
// })

const  RetailCustomer = mongoose.model(' RetailCustomer',RetailCustomerSchema);

module.exports= RetailCustomer
