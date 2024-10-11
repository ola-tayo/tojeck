const mongoose = require('mongoose'); // Erase if already required
const { Decimal128 } = require("mongodb");

// sku sold in van out let
const Sku = new mongoose.Schema({
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Products',
        required:true,
    },
    productName:{type:String},
    vat:{
        type: Decimal128,
        default: 0 
    },
    Vendor:{
        type:mongoose.Types.ObjectId,
        ref:'Vendors',
        required:true,
    },
    Qty:{
        type:Number,
        default:0,
        required:true,
    },
    BuyingPrice:{
        type:Decimal128,
        required:true,
    },
    priceListPrice:{
        type:Decimal128,
        required:true, 
    },
    ActivityLog:{
        type:Array, 
        required:true
    },
    image:{
        type: String,
        default:''
    },
    description:{
        type: String,
        default: '',
    },
    promotion:{
        type:Decimal128,
        default:0,
    },
    productCode:{
        type: String,
        required: true,
        LowerCase: true,
    },
    status:{
        type: Boolean,
        required: true,
        default:true,
        enum: [true, false]
    }

},{ timestamps: true });


//register payment for invoice
const PaymentSchema = new mongoose.Schema({
    invoiceId:{
        type: mongoose.Types.ObjectId,
        ref:'retailInvoice',
        required:true,
    },
    paymentDate:{
        type: Date,
        required: true,
    },
    Amount:{
        type: Decimal128,
        required: true,
    }
   
})



// orderSchema
const orderSchema = new mongoose.Schema({
    product:{
        type:Object,
        ref:'Products',
        required:true,
    },
    purchasedQty:{
        type: Number,
        required: true,
        default:0,
    },
    total:{
        type: Decimal128,
        required: true,
        default:0.00,
    },
    vat:{
        type: Decimal128,
        default: 0,
    },
    tracibility:{
        type: String,
        default: 'OUT',
        enum: ['', 'IN', 'OUT'],
    }
},{ timestamps: true })
// invoice for each van outlet

const InvoiceSchema = new mongoose.Schema({
    InvoiceNumber:{
        type: String,
        required: true,
    },
    InvoiceDate:{
        type: String,
        required: true,
    },
    TotalPrice:{
        type: Decimal128,
        required: true,
        default:0.00,
    },
    orders:[orderSchema],
    customerId:{
        type: mongoose.Types.ObjectId,
        ref:'Customers',
        required:true,
    },
    customerName:{
        type: String,
        required: true,
    },
    subTotal:{
        type: Decimal128,
        required: true,
        default:0.00,
    },
    InvoiceStatus:{
        type: String,
        default: 'order',
        enum: ['order', 'invoice', 'cancelled'],
    },
    vanId:{
        type: mongoose.Types.ObjectId,
        ref:'Vans',
        required:true,
    },
    vanRefNumber:{
        type: Number,
        required: true,
    },
    payment:[PaymentSchema]

},{ timestamps: true });

// Declare the Schema of the Mongo model
var VanSchema = new mongoose.Schema({
   name:{
     type: String,
     required: true,
     unique: true,
     minlength: 3,
     maxlength: 50,
     lowercase: true,
   },
   Driver:{
    type: mongoose.Types.ObjectId,
    ref: 'EMPLOYEES',
    required: true,
    unique: true,
   },
   VehiclePlate:{
    type: String,
    required: true,
    unique: true,
   },
   InvoiceReference:{
    type:Number,
    required: true,
    unique: true,
   },
   Cart:[Sku],
   status: {
    type: String,
    default: 'deactivated',
   },
   invoice:[],
   purchase:[],
   location:{
    type: mongoose.Types.ObjectId,
    ref: 'WHouse',
    required: true,
   },
   proximitySale:{
    type: Boolean,
    default: false,
   },
   Manager:{
    type: mongoose.Types.ObjectId,
    ref: 'EMPLOYEES',
    required: true,
   }

},{timestamps:true});

//Export the model
const Van = mongoose.model('Van', VanSchema);
const retailInvoice = mongoose.model('retailInvoice',InvoiceSchema)
module.exports = {Van , retailInvoice}