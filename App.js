
const express = require("express");
const { ObjectId } = require("mongodb");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/authenticate");
const SendMessages = require("./Functions/NewsFeed")
const cookieParser = require("cookie-parser");
var QRCode = require('qrcode')
const { requireAuth, checkUser } = require("./middleware/authmidddleware");
const Dotenv = require("./.env");
const { WHouse,storeProduct,SkuOpening } = require("./modules/warehouse");
const Employe = require("./modules/Employees");
const Customer = require("./modules/customers");
const CustomerReport = require("./modules/customerReport");
const nodemailer = require("nodemailer");
const Assets = require("./modules/Assets");
const Emails = require("./modules/Email");
const business = require("./modules/company");
const product = require('./modules/Product');
const vendors = require('./modules/Vendors');
const { PASSWORD, EMAIL, ERPSmtpName, url} = require("./.env");
const Expense = require("./modules/Expense");
const NotifyCFO = require("./Functions/NotifyCFO");
const XLSX = require('xlsx');
var moment = require("moment");
const cron = require("node-cron");
var cors = require("cors");

//initialize app
const app = express();

// configuration for cors blocking

const corsOptions ={
  origin:[`${Dotenv.url}`],
  credentials:true,           
  optionSuccessStatus:200,
} 

mongoose.set("strictQuery", true);
mongoose
  .connect(Dotenv.dbUrl, { useNewUrlParser: true })
  .then((result) => {
    app.listen(Dotenv.PORT, () => {
      console.log(`connected to ${Dotenv.PORT}`);
    }),
      console.log("connected to db");
  })
  .catch((err) => console.log(err));

//register view engine
app.set("view engine", "ejs");

//for middle ware
app.use(express.static("public"));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
//declare public folder
app.set("public");

//router for routes
app.use(cors(corsOptions));

app.use("/api/v1", authRoutes);

app.get("/", async (req, res, next) => {
  const PRODUCT = await product.find({Ecom_sale:true})
  
  //create default business object
  if (business.find().countDocuments().exec() < 1) {
    await business.create({
      AnniversiryDate: moment().format('MMM dd YYYY,'),
      CompayLogo: "/img/logo.png",
      email: "",
      CompayName: "",
      Address: "",
      Tel: "",
      CompanyCity: "",
      CompayState: "",
      CompayZip: "",
      InvoicePolicy: "",
      ShopAddress: "",
      
    });
  }
  
  
  const Business = await business.findOne().limit(1);
  //check and CREATE ADMIN
  const employee = await Employe.find();

  if (employee.length < 1) {
    await Employe.create({
      firstName: "Developer",
      lastName: "Bot",
      Email: "operations.bade@gmail.com",
      DOB: "01-01-0001",
      telephone: "+19039377443",
      firstTimeOnboard: true,
      status: "active",
      password: "1234@Bade",
      role: "Admin",
      isAdmin:true,
    }).then((response) => {
      if (response) {
        res.redirect("/api/v1/Dashboard/userid");
      }
    });
  }
  res.status(200).render("index",{title:"Bade",PRODUCT,Business});
});




async function depreciationTask() {
  await Assets.find().then((asset) => {
    asset.forEach(async (asset) => {
      cron.schedule(
        "0 0 * * *",
        async () => {
          // Schedule the cron job to run every minute
          let depreciationDay = moment(asset.depreciationStartDate).format("l");
          let today = moment(new Date()).format("l");
          if (
            depreciationDay.substring(0, 6) === today.substring(0, 6) &&
            asset.CurrentValue !== 0
          ) {
            await Assets.updateOne(
              { _id: asset._id },
              {
                $set: {
                  CurrentValue: parseInt(
                    asset.CurrentValue - asset.ResidualValue
                  ),
                },
              }
            ).then(async (acknowledge) => {
              if (acknowledge) {
                const employee = await Employe.findById(asset.AssignedTo);
                const updated = await Assets.findById(asset._id);
                asset.AcivityLog.push({
                  Date: moment().format("l"),
                  DepreciatedValue: asset.ResidualValue,
                  Assetvalue: updated.CurrentValue,
                });
                asset.save();

                await Expense.create({
                  refNo: Math.floor(Math.random() * Math.random() + 13909),
                  payee: "Asset Register",
                  Amount: `${asset.ResidualValue}`,
                  status: `Approved`,
                  paymentDate: moment().format("l"),
                  Date: moment().format("l"),
                  WHID: employee.workLocation,
                  category: "Asset-Depreciation",
                  remarks: `${
                    asset.AssetCode
                  } Depreciation for ${moment().format("l")}`,
                }).then((expense) => {
                  if (expense) {
                    NotifyCFO(expense);
                  }
                });
              } else {
                asset.AcivityLog.push({
                  Date: moment().format("l"),
                  DepreciatedValue: 0,
                  Assetvalue: updated.CurrentValue,
                });
                asset.save();
              }
            });
          } else if (
            depreciationDay.substring(0, 6) === today.substring(0, 6) &&
            asset.CurrentValue === 0
          ) {
            asset.status = "Depreciated";
            asset.save();
          }
        },
        {
          scheduled: true,
        }
      );
    });
  });
}

// depreciationTask();

const dailyStockBalnce = ()=>{
    // Schedule the cron job to run at 6:00 pM on the every day
    cron.schedule('0 18 * * *',async () => {
      // Your code here
      await storeProduct.find({
        $or: [
          { currentQty: {  $gt: 0 } },
          { Rolls: { $gt: 0 } }
        ]
      }).then(Invproduct =>{
              Invproduct.forEach(async product => {      
                product.ActivitiyLog.unshift({ message: `Closing Stock for ${ moment(new Date()).format("l")} PACK:${product.currentQty}` } )
                product.save()
            })
        })
        
    });

}

dailyStockBalnce()


const openingCustomerBalnce = async ()=>{
  // Schedule the cron job to run at 12:00 AM on the first day of every month
  cron.schedule('0 0 1 * *', async () => {
    //get all customers
    await Customer.find().then(async(customers)=>{
      // create opening balance entry
      //generate report for customer
      customers.forEach(async (customer)=>{
        await CustomerReport.create({
          ReferenceNo: `Openning Bal for ${moment().format("dddd, MMMM Do YYYY,")}`,
          DebitAmount: 0,
          CreditAmount: 0,
          Date: moment().format("l"),
          customerId: customer._id,
          Balance: customer.Debt,
          dr: false,
          cr: false,
        });
      })
     
    })

    
  });
}

openingCustomerBalnce()


// send mails every 1 hr
const MailSender = async ()=>{
  // Schedule a task to run every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    // Your custom logic here
    await Emails.find({status:'Pending'}).then((mails) => {
      mails.forEach((mail) => {
        //send mail to the customer email address
        SendMessages(mail)
        mail.status = 'Sent';
        mail.save();
      })
    });
  });
}

MailSender()


//generate qrcode for produuct
const QrCode = async ()=>{

  // Schedule the cron job to run at 6:00 pM on the every day
  cron.schedule('0 18 * * *',async () => { 
    // Your code here
    await product.find({  QrCode: '' }).then((prod) => {
     prod.forEach((response)=>{
        QRCode.toDataURL(`${url}/api/v1/Product/${response._id}`,function (err, urls) {
          response.QrCode =  urls
          response.save()
        })
     })
    });
    
  });
}

QrCode()

const MothlystockBalnce = async ()=>{
  // Schedule the cron job to run at 12:00 AM on the first day of every month
    cron.schedule('0 9 1 * * ', async () => {
        // Your code here
        await storeProduct.find({
          $or: [
            { currentQty: {  $gt: 0 } },
            { Rolls: { $gt: 0 } }
          ]
        })
        .then(async (products)=>{

          //calculate valur for each product
          const OpenValue = (params1,params2,params3,params4)=>{
            return  parseInt(params1 * params3) + parseInt( (params3 / params4.Rolls) * params2  )
          }

          products.forEach(async (prod) =>{
            const ogProduct = await product.findById(prod.productId)
            await SkuOpening.create({
              product:ObjectId(prod._id),
              productName:prod.productName,
              Vendor:ObjectId(prod.Vendor),
              OpeningCRTN:prod.currentQty,
              Date:moment().format("l"),
              WareHouse:ObjectId(prod.WHIDS),
              BuyingPrice:prod.VendorPrice,
              OpeningROLL:prod.Rolls,
              value:OpenValue(prod.currentQty,prod.Rolls,prod.VendorPrice,ogProduct),
              remark:'Opening'
            })
            
          })
        })
    })

}

// MothlystockBalnce()