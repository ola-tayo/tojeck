const mongoose = require('mongoose')

const RetailPaymentSchema = new mongoose.Schema( {  

    paymentReferenceNo:{
        type:String,
        unique:true,
    },
    Accountant:{//person who actions the payment
        type:String,
    },
    status:{
        type:String,
        default:'posted'
    },
    PaymentDate:String,
    customer: {
        type: mongoose.Types.ObjectId,
        ref: 'customer',
        required: false,
    },
    transactionAmount:{
        type:Number,
        default:0
    },
    collectionRef:{
        type:String,
        enum:['INV','PYMT','RTN','Opening']
    },
    cr:{
        type:Boolean
    },
    dr:{
        type:Boolean
    },
    Balance:Number,
    BillId:{
        type:String,
        default:''
    },
},{timestamps:true})

const RetailTransaction = mongoose.model('RetailTransaction', RetailPaymentSchema);

module.exports = RetailTransaction