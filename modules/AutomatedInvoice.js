const mongoose = require('mongoose')

// SCVHEMMER FOR ORDERS
const ORDERS = new mongoose.Schema({
    promotionData:{
        type:Number,
        defaultValue:0,
        required:true,
    },
    BatchId:{
        type:String,
        defaultValue:''
    },
    CRT:{
        type:Number,
        default:0,
        required:true,
    },
    ExpiryDate:{
        type:String,
    },
    ROL:{
        type:Number,
        default:0,
        required:true,
    },
    item:{
        type:Object,
        required:true,
    },
    returnId:{
        default:'',
        type:String
    }, 
    storeProductId:{// cant add duplicate product 
        type:mongoose.Types.ObjectId,
        ref:'storeProduct',
        required:true,
        unique:true,
    },
    ROLQTY:{
        default:0,
        type:Number,
        required:true,
    },
    Qty:{
        default:0,
        type:Number,
        required:true,
    },
    priceListPrice:{
        type:Number,
        required:true,
        deault:0
    },
    total:{
        type:Number,
        required:true,
        default:0
    }
})


const AutomatedInvoiceSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Types.ObjectId,ref:'customers',
        required:true,
    },
    grandTotal:{type:Number},
    shippingFee:{type:Number},
    subTotal:{type:Number},
    startDate:{
        type:String,
        required:true,
    },
    paymentMethod:{type:String},
    orders:[ORDERS],
    promotionItems:[],
    billStatus:{
        type:String,
        default:'Order'
    },
    status:{
        type:String,
    },
    bankAccount:{
        type: String,
    },
    discount:{type:Number},
    taxRate:{type:Number, default:0},
    whId:{
        type:mongoose.Types.ObjectId,
        ref:'whouses',
        required:true,
        unique:true
    },
    RaiseBy:{type:String},
    signatureUrl:{type:String},
    ActivityLog:[],
    rejectionReasons:String,
    registeredBalance:{type:Number},//amount collected from account alerts or cash payment
    isDelivered:{type:Boolean,default:false},//for delivery
    PaymentStatus:{type:String},//type of payment status either fully paid or half paid
    DELIVERYDATE:{type:Date},//delivery date of delivery order
    billReferenceNo:{type:String},//reference to eacch bill
    supportDoc:{type:String},//uploaded bank payment reference
    DriverNumber:String,
    DriverName:String,
    vehicleNumber:String,
    DeliveryComment:String,
    customerName:String,
    whProductId:mongoose.Types.ObjectId,//to map back to store object of product  so we can reduce quantity
    AccountantId:{
        type:mongoose.Types.ObjectId,
        ref:'Employees',
    },
    AccountantName:{
        type: String,
    },
    WayBillNo:String,
    salesPerson:{
        type:mongoose.Types.ObjectId,
        ref:'Employees',
    },
    invoicelocation:{type:String,required:true},
    priceList:String,
},{timestamps:true})

const AutomatedInvoice = mongoose.model('AutomatedInvoice',AutomatedInvoiceSchema)

module.exports = AutomatedInvoice