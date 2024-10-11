const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    item:{
        type:Object,
        required:true,
    },
    Qty:{
        type:Number,
        default:0   
    },
    roll:{
        type:Number,
        default:0   
    },
    total:{
        type:Number,
        default:0   
    },
    ExpDate:{
        type:String,
        default:''   
    },
    Status:{
        type:String,
        default:'',  
    },
    BatchNo:{
        type:String,
        default:''   
    },
    storeproductId:{
        type:mongoose.Types.ObjectId,
        ref: 'storeProduct',
        required: true, 
    },
})

const PurchaseOrderSchema = new mongoose.Schema({
    Vendor: {
        type: mongoose.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    WHID: {
        type: mongoose.Types.ObjectId,
        ref: 'WHous',
        required: true,
    },
    orders: [orderSchema],
    shippingFee: { type: Number,default:0 },
    subTotal: { type: Number ,default:0},
    grandTotal: { type: Number,default:0 },
    discount: { type: Number, default:0},
    taxRate: {type:Number,default:0},
    billReferenceNo: {
        type: String,
    },
    paymentStatus: {
        type: String,
        default:'pending'
    },
    PaymentRef:String,
    ActivityLog: [],
    recievedDate:String,
    Attachment: String,
    CFO:{
        type:String,
    },
    AmountPaid:{
        type:Number,
        default:0
    },
    PaymentDate:String,
    bankAccount:{
        type: String,
    },
    status:{
        type:String,
        default:'Pending',
    },
    StoreKeeperConfirmation : {
        type:Boolean,
        default:false,
    },
    RejectionReason:{
        type:String
    },
    ReturnQty :{
        type:Number,
        default:0,
    },
    Remarks:String,
    transferedDate:String,
},{timestamps:true})

const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema)

module.exports = PurchaseOrder