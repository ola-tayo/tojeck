const mongoose = require('mongoose');
const { isEmail} = require('validator');
const { Decimal128 } = require("mongodb");

const SkuOpeningSchema = new mongoose.Schema({
    product:{
        type:mongoose.Types.ObjectId,
        ref:'storeProduct',
        required:true,
    },
    productName:{type:String},
    Vendor:{
        type:mongoose.Types.ObjectId,
        ref:'Vendors',
        required:true,
    },
    OpeningROLL:{type:Number},
    OpeningCRTN:{type:Number},
    Date:{type:String, required:true},
    WareHouse:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse',
        required:true,
    },
    BuyingPrice:{type:Decimal128},
    value:{type:Number, required:true},
    remark:{type:String}

},{ timestamps: true });

const StorageSchema =  new mongoose.Schema({
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Products',
        required:true,
    },
    Vendor: { 
        type:mongoose.Types.ObjectId,
         required: [true, "Provide vendor"],
         ref:'Vendor',
    },
    ADCcode:{
        type:String
    },
    productName:String,
    UOM:String,
    image:String,
    isActivated:{
        type:Boolean,
        default:true
    },
    autoReplenishment:{
        type:Boolean,
        default:false
    },
    replenishQty:{
        type:Number,
        default:0
    },
    WHIDS:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse',
        required:true,
    },
    currentQty:{
        type:Number,
        default:0
    },
    replenishBy:{
        type:String,
    },
    pendings:{
        type:Number,
        default:0
    },
    replenishMin:{
        type:Number,
        default:0
    },
    ActivitiyLog:[],
    mailsent:{
        type:Boolean,
        default:false
    },
    Rolls:{
        type:Number,
        default:0
    },
    vendorName:String,
    category:String,
    ExpDate:{
        type:String,
        default:'',
    },
    BatchNo:{
        type:String,
        default:'',
    },
    LastBatchDate:{
        type:String,
        default:'',
    },
    VendorPrice:{
        type:Number,
        default:0
    },
    Van_Price:{
        type:Number,
        default:0
    },
    Market_Price:{
        type:Number,
        default:0
    },
    WareHouse_Price:{
        type:Number,
        default:0
    },
    QrCode:{
        type:String,
        default:'',
    }
})



const WHSchema = new  mongoose.Schema({
    WHName:{
        type : String,
        required:true,
        lowercase:true
    },
    toRecive:[],
    Bills:[],
    Storage:[ StorageSchema ],
    Notification:{
        type:Array,
    },
    expense:{
        type:Array,
    },
    Tel:{
        type:String,
    },
    Email:{
        type:String,
        required:[true,'please entert an Email'],
        lowercase:true,
        validate:[isEmail,'please eneter a valid Email']
    },
    Status:{
        type:Boolean,
        default:false,
    },
    state:{
        type:String,
    },
    InvoiceNo:{
        type:String,
        required:true
    },
    StoreKeeper:{
        type:Object,
    },
    Documents:{
        type:Array,
    },
    WHIDS:{
        type: String,
    },
    Note:{
        type:Array,
    },
    Manager:Object,
    Scrap:{
        type:Array,
    },
    Address:String,
    location:{
        type:String,
        ref:'location',
    },
},{timestamps:true});

const  WHouse = mongoose.model(' WHouse',WHSchema);
const SkuOpening = mongoose.model('OpeningPNL',SkuOpeningSchema)
const storeProduct = mongoose.model('storeProduct',StorageSchema)

module.exports = {WHouse,SkuOpening,storeProduct};