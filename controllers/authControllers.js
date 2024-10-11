const customer = require("../modules/customers");
const CustomerReport = require("../modules/customerReport");
const { PASSWORD, EMAIL, ERPSmtpName ,url,accountSid,authToken,twiloNumber} = require("../.env");
const client = require("twilio")(
  accountSid,
  authToken,
);
var QRCode = require('qrcode')
const AutomatedInvoice = require('../modules/AutomatedInvoice')
const Helpdesk = require("../modules/Tickets");
const BeamCard = require("../modules/BeamCard");
const workContract = require("../modules/WorkContract");
const Event = require("../modules/Events");
const Assets = require("../modules/Assets");
const Timeoff = require("../modules/Timeoff");
const KPI = require("../modules/kpi");
const Location = require("../modules/Location");
const Lead = require("../modules/Leads");
const Product = require("../modules/Product");
const Vendor = require("../modules/Vendors");
const { WHouse, storeProduct,SkuOpening } = require("../modules/warehouse");
const Scrap = require("../modules/Scrap");
const Employe = require("../modules/Employees");
const NotifyLogin = require("../Functions/NotifyLoin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const NotifyAccountant = require("../Functions/NotifyAccountant"); //for Accountant
const Appraisals = require("../modules/Appraisal");
const NotifyStoreKeeper = require("../Functions/NotifyStoreKeeper");
const NotifyCFOPO = require("../Functions/NotifyCFOPO");
const NotifyAccountantP0 = require("../Functions/NotifyAccountantPO");
const NotifyStoreKeeperPO = require("../Functions/NotifyStoreKeeperPO");
const NotifyInvoicerPODeclined = require("../Functions/NotifyInvoicerPODeclined");
const AppraisalNotify = require("../Functions/AppraisalNotification");
const PurchaseOrder = require("../modules/purchaseOrder");
const Expense = require("../modules/Expense");
const NotifyCFO = require("../Functions/NotifyCFO");
var id = new mongoose.Types.ObjectId();
const bills = require("../modules/Bills");
const NaijaStates = require("naija-state-local-government");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");
var moment = require("moment");
let date = new Date();
var responseDate = moment(date).format("dddd, MMMM Do YYYY,");
const Account = require("../modules/BankAccount");
const CreditCustomerPayment = require("../modules/Creditpayment");
const Customer = require("../modules/customers");
const ProductTransfer = require("../modules/WHTransferLog");
const NotifyCustomerCreate = require("../Functions/NotifyCustomerCreate");
const companyRegister = require("../modules/company");
const EmployeeOnboarded = require("../Functions/EmployeeOnbord");
const { response } = require("express");
const { ExpenseCat, ProductCat, UMO } = require("../modules/expenseCategory");
const AutoReplenishCheck = require("../Functions/AutoReplenishCheck");
const { parseInt } = require("lodash");
const Returns = require("../modules/Returns");
const StockRequest = require("../modules/StockRequest");
const { OPEN_AI_API_KEY } = require("../.env");
const { Configuration, OpenAIApi } = require("openai");
const readline = require("readline");
const PayVendor = require("../modules/VendorBill");
const HistoricalpriceChange = require("../modules/HistoricalPrice");
const {jobTittle,Department} = require("../modules/departments");
const {Van, retailInvoice} = require('../modules/Van')

// function for currency
const currency = (Amount)=>{
  f = new Intl.NumberFormat(undefined,{
    currency:"NGN",
    style:"currency"
  })
  return f.format(Amount)
}

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", phone: "" };

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    errors.phone = "This Phone number is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "BigBern", {
    expiresIn: maxAge,
  });
};

//get user signature token
module.exports.Signature_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.userId)) {
    try {
      await Employe.findById(req.params.userId).then(async (user) => {
        if (user) {
          let auth 
          user.opsCode === req.params.opInput ? auth = true : false
          // const auth = await bcrypt.compare(req.params.opInput, user.opsCode);
          if (auth) {
            return res.status(200).json({ signature: 'Authorized' });
          } else {
            throw new Error(`Wrong Passcode Entered`);
          }
        } else {
          throw new Error("No user found matching passcode");
        }
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

module.exports.companyRegister_get = async (req, res) => {
  const states = await NaijaStates.all();
  const Business = await companyRegister.findOne();
  res.status(200).render("companyRegister", { name: "BADE", states, Business });
};

module.exports.companyRegister_post = async (req, res, next) => {
  try {
    const Business = await companyRegister.find();
    if (Business.length > 0) {
      throw new Error("company Already registered");
    } else {
      await companyRegister.create(req.body).then((registerd) => {
        if (registerd) {
          next();
        } else {
          throw new Error("Registration failed");
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.Dashboard_get = async (req, res) => {
  // client.messages
  //   .create({
  //       body: `${ERPSmtpName} SMS Notification; Van Products are on promo. Kindly check your product list to update if necessary.`,
  //       from: twiloNumber,
  //       to: '+2349047542925'
  //   })
  //   .then(message => console.log(message.sid))

  // AutoReplenishCheck()//run autoreplenish notifications
  //get last day of the month
  const lastDayOfMonth = moment().endOf("month").format("DD");
  //get first day of the month
  const firstDayOfMonth = moment().startOf("month").format("DD");
  //get today's date
  const promotions = []
  const today = moment().format("DD");
  
  if(lastDayOfMonth === today || firstDayOfMonth === today ) {
    // check for product on promotion ,,
    await Product.find({$and:[{VanPromo:{$gt:0}}]}).exec()
    .then(product => {
      promotions.push(...product)
    })

    await Product.find({$and:[{WholesalePromo:{$gt:0}}]}).exec()
    .then(product => {
      promotions.push(...product)
    })

    await Product.find({$and:[{MarketPromo:{$gt:0}}]}).exec()
    .then(product => {
      promotions.push(...product)
    })

    
    //send sms to admin for notification
    client.messages
    .create({
        body: `${ERPSmtpName} SMS Notification; ${promotions.length} Van Products are on promo. Kindly check your product list to update if necessary.`,
        from: twiloNumber,
        to: '+2349047542925'
    })
    .then(message => console.log(message.sid))
//     .done();
    // const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  }


  // send  birthday mail automatically
  const birth = moment().format();
  const data = await Employe.find({$and: [
    { status: "active" },]}); 
  const company = await companyRegister.findOne();

  const birthdayPerson = data.filter((person) => {
    return (
      person.DOB.toString().substring(5, 10) === birth.substring(5, 10) &&
      person.EndDate === ""
    );
  });
  res.render("dashboard", {
    title: "Dashboard",
    name: "BADE",
    responseDate,
    birthdayPerson,
    company,
    promotions
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup", { title: "Ecommerce", name: "BADE" });
};

module.exports.signin_get = async (req, res) => {
  const employee = await Employe.find();
  if (employee.length < 1) {
    await Employe.create({
      firstName: "Developer",
      lastName: "Bot",
      Email: "Bennygroove8@gmail.com",
      DOB: "01-01-0001",
      telephone: "+19039377443",
      firstTimeOnboard: true,
      status: "active",
      password: "1234@Bade",
      role: "Admin",
    }).then((response) => {
      if (response) {
        res.render("SignIn", {
          title: "Ecommerce",
          name: "BADE",
          responseDate,
        });
      }
    });
  }
  res.render("SignIn", { title: "Log-In", name: "BADE", responseDate });
};

module.exports.cart_get = (req, res) => {
  res.render("Cart", { title: "Ecommerce", name: "BADE" });
};

module.exports.FAQ_get = (req, res) => {
  res.render("FAQ", { title: "Ecommerce", name: "BADE" });
};

module.exports.index_get = (req, res) => {
  res.render("index", { title: "Ecommerce", name: "BADE" });
};

module.exports.Notification_get = async (req, res) => {
  const wHouse = await WHouse.findOne({ _id: new ObjectId(req.params.WHID)});
  res.render("Notification", {
    name: "BADE",
    results: wHouse,
  });
};


module.exports.Reset_get = (req, res) => {
  res.render("Reset", { title: "Ecommerce", name: "BADE" });
};

module.exports.logout_get = async (req, res) => {
  const person = await Employe.findById(req.params.USERID);

  person.lastSeen = moment().format("l");
  person.save();
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

// register new employee
module.exports.Register_post = async (req, res) => {
  try {
    await Employe.create(req.body).then((NewEmployee) => {
      if (NewEmployee) {
        res.status(200).json({
          message:
            "New Employee Registered. You should send them an invite when you are ready to onboard them",
        });
      } else {
        throw new Error("Something went wrong");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//OnboardEmployee_get
module.exports.OnboardEmployee_get = async (req, res) => {
  const states = await NaijaStates.all();
  const Warehouse = await WHouse.find();
  const jobTittles = await jobTittle.find()
  const Departments = await Department.find()
  //  console.log(NaijaStates.lgas("Oyo"))
  const Employee = await Employe.find().sort({ firstName: 1 });
  res
    .status(200)
    .render("employeeRegister", { name: "BADE", states, Employee, Warehouse ,jobTittles,Departments});
};

// for onboarding
module.exports.OnboardEmployee_patch = async (req, res) => {
  try {
    await Employe.findById(req.params.EmployeeId).then(async (employed) => {
      if (!employed.firstTimeOnboard) {
        // send onboarding mail notification
        let handelPassword = `${Math.floor(
          Math.random() * 12275
        )}${req.body.firstName.substring(0, 4)}`;
        // const saltOps
        let handelOps = Math.floor(Math.random() * 12275);

        const salt = bcrypt.genSaltSync(4);
        const hashpassword = bcrypt.hashSync(handelPassword, salt);
        // const hashops = bcrypt.hashSync(handelOps, salt);
        // Store hash in your password DB.
        employed.password = hashpassword
        employed.opsCode = handelOps;
        employed.save();
        EmployeeOnboarded(employed, handelPassword, handelOps); //send mail to employee onboarded
        res.status(200).json({ message: "Onboardin mail sent sucessfully" });
      } else if (employed.firstTimeOnboard) {
        await Employe.updateOne(
          { _id: req.params.EmployeeId },
          { $set: req.body }
        ).then((update) => {
          if (update.acknowledged) {
            res.status(200).json({ message: "updated successfully" });
          } else {
            throw new Error("update failed");
          }
        });
      } else {
        throw new Error("Something seems wrong. Please try again");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// single employee get
module.exports.getSingleEmployee_get = async (req, res) => {
  if (ObjectId.isValid(req.params.EmployeeId)) {
    try {
      const states = await NaijaStates.all();
      const Employee = await Employe.findById(req.params.EmployeeId);
      const Warehouse = await WHouse.find();
      const WH = await WHouse.findById(Employee.workLocation);
      const jobTittles = await jobTittle.find()
      const Departments = await Department.find()
      const contract = await workContract.find()
      const Equiptment = await Assets.find({AssignedTo:req.params.EmployeeId})
      const Employees = await Employe.find({$and: [
        { status: "active" }]}); 
      res.status(200).render("SingleEmployee", {
        Employee,
        WH,
        states,
        Warehouse,
        Employees,
        name: "BADE",
        Equiptment,
        contract,
        jobTittles,
        Departments
      });
    } catch (error) {
      console.log(error);
    }
  }
};

//login
module.exports.signin_post = async (req, res) => {
  const { Email, password } = req.body;
  try {
    await Employe.findOne({ Email: Email })
      .limit(1)
      .then(async (data) => {
        if (data) {
          const auth = await bcrypt.compare(password, data.password);
          if (auth) {
            const token = createToken(data._id);
            // send login notification here
            NotifyLogin(data);
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(200).json({ Newcustomer: data._id });
          } else {
            res.status(500).json({errorPassword:'Wrong Password Entered'})
          }
        } else {
          throw new Error("Not a registered Email");
        }
      });
  } catch (e) {
    res.status(500).json({ serverError: e.message });
  }
};

//for password reset
module.exports.ResetEmail_get = async (req, res, next) => {
  try {
    await Employe.findOne({ Email: req.params.EmailTOreset })
      .limit(1)
      .then(async (data) => {
        if (!data) {
          res.status(404);
          throw new Error("No user account Found");
        } else {
          next();
        }
      });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

//make patch request to update  an item
module.exports.ResetId_patch = async (req, res) => {
  let update = req.body;

  const salt = await bcrypt.genSalt();
  const handelPassword = await bcrypt.hash(update.password, salt);

  update.password = handelPassword;

  if (ObjectId.isValid(req.params.id)) {
    await Employe.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then(async (result) => {
        if (result.acknowledged) {
          await Employe.findById(req.params.id).then((user) => {
            // user.status = 'active'
            user.firstTimeOnboard = true;
            user.save();
          });
          const token = createToken(req.params.id);
          res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
          res.status(200).json({ Newcustomer: req.params.id });
        } else {
          throw new Error("Bad request");
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

// for Lead creation from footer
module.exports.Lead_post = async (req, res) => {
  const { Email } = req.body;
  try {
    await Lead.create({ Email });
    res.status(201).json({ Message: "registered" });
  } catch (err) {
    res.status(500).json({ ERROR: err.message });
  }
};

// for sales module. please copy  when done
module.exports.WorkContract_get = async (req, res) => {
  res.status(200).render("workContract", { name: "BADE" });
};

// create workContract
module.exports.workContract_post = async (req,res)=>{
  await workContract.create(req.body).then(contract =>{
    if(contract){
      res.status(200).json({message:'contract created succesfully'})
    }
  })
}


// get request for leave
module.exports.TimeOFF_get = async (req,res)=>{

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.timeoffs = await Timeoff.find().sort({status:-1})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Timeoff.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const searchAllTimeoff = await Timeoff.find().sort({status:-1});
  res.status(200).render("Timeoff", { name: "BADE" ,result,searchAllTimeoff});
}

// edit leave request 
module.exports.leaveRequests_patch = async (req,res,next) =>{
    try{

      if(ObjectId.isValid(req.query.timeoffId)) {
        if(req.query.action !== 'HR Approved'){
          await Timeoff.updateOne({_id:ObjectId(req.query.timeoffId)},{ $set: { status : req.query.action }})
          .then((acknowledged)=>{
            if(acknowledged){
              res.status(200).json({message:req.query.action})
            }else{
              throw new Error('Something went wrong')
            }
          })
        }else if(req.query.action === 'HR Approved'){
          // deduct from allocated time off and generate payroll entry for paid leave request that hass been approved by
          next()
        }
      }
    }catch(error){
      res.status(500).json({error:error.message})
    }
}

//create a new leave request
module.exports.leaveRequests_post = async (req,res,next) =>{
  await Timeoff.create(req.body).then((timeoff)=>{
   
    res.status(200).json({message:'Request logged sucessfully'})
  })
}

// get single time off
module.exports.SingleTimeOff = async (req,res,next) =>{
  if(ObjectId.isValid(req.query.id)) {

    await Timeoff.findById(req.query.id).then((timeoff)=>{
      res.status(201).render('SingleLeave',{timeoff,name:'BADE'})
    })
  }
}

//delete a product
module.exports.Product_delete = async (req, res) => {
  if (ObjectId.isValid(req.params.ProductId)) {
    try {
      await Product.findById(req.params.ProductId).then(async (product) => {
        if (!product.Sellable) {
          await Product.deleteOne({ _id: req.params.ProductId }).then(
            (acknowledged) => {
              if (acknowledged) {
                async function RemoveStoreProduct() {
                  await storeProduct
                    .find({ productId: req.params.ProductId })
                    .then((invenntoryProduct) => {
                      if (invenntoryProduct.length > 0) {
                        invenntoryProduct.forEach(async (product) => {
                          await storeProduct.deleteOne({
                            productId: product.productId,
                          });
                          res.redirect("/api/v1/Products");
                        });
                      } else {
                        res.redirect("/api/v1/Products");
                      }
                    });
                }
                RemoveStoreProduct();
              }
            }
          );
        }
      });
    } catch (err) {
      console.log(err.message);
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

// CLONE A product
module.exports.SingleProductClone = async (req, res, next) => {
  await Product.findById(req.params.PRODUCTID).then(async (product) => {
    await Product.create({
      Name: `${product.Name} COPY`,
      category: product.category,
      image: "",
      WareHouse_Price: 0,
      Market_Price: 0,
      vendor_Price: 0,
      Van_Price: 0,
      Vendor: product.Vendor,
      UMO:product.UMO,
      color: product.color,
      Description: product.Description,
      Sellable: false,
      Ecom_sale: false,
      Manufacture_code: product.Manufacture_code,
      product_code: product.product_code,
      ACDcode: `COPY${product.ACDcode}${Math.floor(Math.random()*109394)}`,
      VAT: product.VAT,
      ActivityLog: [],
      virtualQty: 0,
      Roll: 1,
      
    }).then(async (response) => {
      if (response) {
       QRCode.toDataURL(`${url}/api/v1/Product/${response._id}`,function (err, urls) {
        response.QrCode =  urls
        response.save()
      })
        res.redirect(`/api/v1/Product/${response._id}`);
      } else {
        res.end();
      }
    });
  });
};

//get and dispaly all vendor
module.exports.Vendors_get = async (req, res) => {
  const vendor = await Vendor.find();
  res.render("Vendors", { vendor, title: "Vendors", name: "BADE" });
};


module.exports.VendorCreate_post = async (req, res) => {
  try {
    await Vendor.create(req.body);
    res.status(200).json({ Message: "New Vendor Registered" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// get all products
module.exports.Product_get = async (req, res) => {
  const Products = await Product.find().sort({Name:1});
  const vendor = await Vendor.find();
  const umo = await UMO.find();
  const productcat = await ProductCat.find();
  res.render("Products", { Products, title: "Sales", name: "BADE" ,vendor,umo,productcat});
};

//get single product
module.exports.SingleProduct_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try{
      await Product.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (product) => {
        const vendor = await Vendor.find();
        const umo = await UMO.find();
        const productcat = await ProductCat.find();
        const HistoricalPrice = await HistoricalpriceChange.find({productId:product._id})
        res.status(200).render("ProductEdit", {
          product,
          vendor,
          productcat,
          umo,
          name: "BADE",
          HistoricalPrice
        });
      });
    }catch(err){
      console.log(err.message);
    }
  }
};

// get request for single product using adc code
module.exports.SingleProductAdc_get = async (req, res) => {
  try {
    await Product.findOne({ ACDcode: req.params.referenceNo })
      .limit(1)
      .then(async (product) => {
        if (product) {
          const vendor = await Vendor.find();
          const umo = await UMO.find();
          const productcat = await ProductCat.find();
          res.status(200).render("ProductEdit", {
            product,
            vendor,
            productcat,
            umo,
            name: "BADE",
          });
        } else {
          throw new Error("No product found");
        }
      });
  } catch (err) {
    if (err) {
      res.redirect("/api/v1/404");
    }
  }
};

//get all ecomerce customers
module.exports.Customer_get = async (req, res) => {
  const user = await Employe.findById(req.query.user);
  let Cusomers;
  if (user.isAdmin || user.isAccountant || user.isCFO){
    Cusomers = await customer.find()
  }else{
    Cusomers = await customer.find({$and: [
      { salesPerson: req.query.user },{blocked:false}]});
  }
  const states = await NaijaStates.all();
  const employees = await Employe.find({$and: [
    { status: "active" }]}); ;
  res.render("Customers", { Cusomers, title: "Sales", name: "BADE" ,employees,states});
};

//get all customers in json
module.exports.GetAllCstomers = async (req,res,next) =>{
  const Cusomers = await customer.find();
  const Employee = await Employe.find();
  const WH = await WHouse.find();
  res.status(200).json({customers:Cusomers,Employee,WH});
}

// create new product
module.exports.ProductCreate_post = async (req, res) => {
  try {
    await Product.create(req.body).then(async function (product) {
      product
        ? res.status(200).json({
            Message:
              "New Product Created Please register this new product in all ware house",
          })
        : new Error("Something went wrong");
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//product edit and storeproducts
module.exports.Product_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    await Product.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then(async (acknowledged) => {
        if (acknowledged) {
          const Prod = await Product.findById(req.params.id);
          await storeProduct
            .find({ productId: ObjectId(req.params.id) })
            .then(async (product) => {
              const vendor = await Vendor.findById(update.Vendor);
              product.forEach(async (storeProductId) => {
                const newUpdate = {
                  productName: Prod.Name,
                  ADCcode: Prod.ACDcode,
                  image: Prod.image,
                  Vendor: ObjectId(Prod.Vendor),
                  vendorName: vendor.Name,
                  category: Prod.category,
                  VendorPrice: Prod.vendor_Price,
                  Van_Price: Prod.Van_Price,
                  Market_Price: Prod.Market_Price,
                  WareHouse_Price: Prod.WareHouse_Price,
                };
                await storeProduct.updateOne(
                  { _id: ObjectId(storeProductId._id) },
                  { $set: newUpdate }
                );
              });
            });

            //update product on  Van cart for each van
            await Van.find().exec().then((van) => {
              van.forEach(async (van) => {
               // update the product on the van cart
               await Van.updateOne(
                {
                  _id: van._id,
                  "Cart.productId": Prod._id
                },
                {
                  $set: {
                    "Cart.$.productName":Prod.Name,
                    "Cart.$.vat":Prod.VAT,
                    "Cart.$.Vendor":Prod.Vendor,
                    "Cart.$.priceListPrice":Math.ceil(Prod.Van_Price / Prod.Pieces),
                    "Cart.$.promotion":Math.ceil(Prod.VanPromo / Prod.Pieces),
                    "Cart.$.productCode":Prod.ACDcode,
                    "Cart.$.status":Prod.Ecom_sale,
                  }
                },  
              )
              });
            });
            
        }
        res.status(200).json({ result: "Product Updated" });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

// get product  returns store product id
module.exports.productFind_get = async (req, res) => {
  await Product.findOne({ ACDcode: req.params.ACDcode })
    .limit(1)
    .then(async (item) => {
      await storeProduct.find({ WHIDS: req.params.WHID }).then((product) => {
        storeID = product.filter((storeProduct) => {
          return storeProduct.productId.toString() === item._id.toString();
        });
        const _id = storeID.map((id) => {
          return id._id;
        });

        // send batch id for store product to be captured on line items to be used on pnl report
        const BatchId = storeID[0].BatchNo;
        const ExpiryDate = storeID[0].ExpDate;
        const CRT = storeID[0].currentQty;
        const ROL = storeID[0].Rolls;

        res.status(200).json({ item, _id, BatchId, ExpiryDate, CRT, ROL });
      });
    });
};

//FOR WARE HOUSE TRANSFER PRODUCT
module.exports.StoreProductFindNodIde_get = async (req, res, next) => {
  try {
    item = await storeProduct.findOne({
      $and: [
        { ADCcode: { $in: [req.params.ACDcode] } },
        { WHIDS: { $in: [ObjectId(req.params.from)] } },
      ],
    });
    toId = await storeProduct.findOne({
      $and: [
        { ADCcode: { $in: [req.params.ACDcode] } },
        { WHIDS: { $in: [ObjectId(req.params.to)] } },
      ],
    });

    res.status(200).json({ item, ToId: toId._id });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
};

// get product from invoice returns store product id
module.exports.productFindNodIde_get = async (req, res) => {
  await Product.findOne({ ACDcode: req.params.ACDcode })
    .limit(1)
    .then((item) => {
      res.status(200).json({ item });
    });
};

//get customer
module.exports.CustomerFind_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    await customer
      .findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (item) => {
        const Accounts = await Account.findOne({
          _id: ObjectId(item.BankJournal),
        });
        res.status(200).json({ item, Accounts });
      })
      .catch((err) => console.log(err.message));
  }
};

//for warehouse ops
module.exports.warehouse_get = async (req, res, next) => {
  const WHouses = await WHouse.find();
  res.render("warehouse", {
    title: "Warehouse",
    WHouses,
    name: "BADE",
  });
};

//post request for warehouse
module.exports.wareHouse_post = async (req, res) => {
  try {
    await WHouse.create(req.body).then(async (result) => {
      if (result) {
        //create warehouse product from list of products
        await Product.find().then(async (prod) => {
          prod.forEach(async (product) => {
            await storeProduct.create({
              WHIDS: result._id,
              productId: product._id,
              ADCcode: product.ACDcode,
              productName: product.Name,
              UOM: product.UMO,
              image: product.image,
              Vendor: product.Vendor,
              VendorPrice: product.vendor_Price,
              Van_Price: product.Van_Price,
              Market_Price: product.Market_Price,
              WareHouse_Price: product.WareHouse_Price,
              category: product.category,
              
            }).then((response)=>{
              QRCode.toDataURL(`${url}/api/v1/StoreProduct/${response._id}/${result._id}`,function (err, urls) {
                response.QrCode = urls
                response.save()
              })
            })
          });
          // registerdProduct.ActivitiyLog.push({message: `Product registered successfully by Administrator on ${responseDate}`})

          result.Notification.unshift({
            message: `${prod.length} New products has been created in your inventory catalog by Administrator. on ${responseDate}`,
          });

          // registerdProduct.save()

          result.save();

          res.status(200).json({
            success:
              "New ware House created. you should activate the ware house so operations can be performed",
          });
        });
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// warehouse returns
module.exports.WareHouseReturns_get = async (req, res) => {
  const result = await WHouse.findById(req.params.WHID);
  const ReturnsBill = await Returns.find({ WHId: result._id })
  .sort( {status: -1}).sort({createdAt: -1 });

  res
    .status(200)
    .render("WareHouseReturns", { result, ReturnsBill, name: "BADE" });
};

//to get warehouse Delivery for each ware house
module.exports.warehouseDelivery_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    await WHouse.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (item) => {
        await bills.find({ whId: ObjectId(item._id) }).then(async (bill) => {
          const page = parseInt(req.query.page);
          const limit = parseInt(req.query.limit);

          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const results = {};
          results.DeliveredBill = await bills
            .find({ whId: ObjectId(item._id) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex)
            .exec()
            .then((bills) => {
              if (req.query.category === "all") {
                return bills;
              } else {
                return bills.filter((bill) => {
                  return (
                    bill.billStatus.toLowerCase() ===
                    req.query.category.toLowerCase()
                  );
                });
              }
            });

          if (endIndex < (await bills.find().countDocuments().exec())) {
            results.next = {
              page: page + 1,
              limit: limit,
            };
          }

          if (startIndex > 0) {
            results.Previous = {
              page: page - 1,
              limit: limit,
            };
          }

          results.currentPage = req.query.page;
          results.currentCat = req.query.category;

          let Bills = await bill.filter((bill) => {
            return (
              bill.isDelivered === false && bill.billStatus !== "Cancelled"
            );
          });
          res.status(200).render("warehouseops", {
            result: item,
            Bills,
            results,
            name: "BADE",
          });
        });
      });
  }
};

module.exports.delivery_get = async (req, res) => {
  //sends json for delivery form
  const deliveryBill = await bills.findById(req.params.deliveryId);
  const Customers = await customer.findById(
    new ObjectId(deliveryBill.customer)
  );
  res.status(200).json({ deliveryBill, Customers });
};

// update delivery action form ware house store keeper
module.exports.delivery_patch = async (req, res) => {
  const update = req.body;
  await bills.findById(req.params.deliveryId).then(async (done) => {
    if (done.isDelivered) {
      res
        .status(500)
        .json({ error: "Fraud alert, This batch has already been delivered" });
    } else {
      await bills
        .updateOne({ _id: req.params.deliveryId }, { $set: update })
        .then((acknowledged) => {
          if (acknowledged) {
            // done.DELIVERYDATE = req.body.DELIVERYDATE
            // done.isDelivered = true
            done.ActivityLog.unshift({
              logMsg: `Delivery Done on ${responseDate} by ${req.params.id}`,
              status: `Invoice`,
            });
            done.billStatus = "Invoice";
            done.save();
            AutoReplenishCheck(); //run autoreplenish notifications
            res.status(200).json({ message: "Delivery Sucessfull" });
          } else {
            res.status(500).json({ error: "Something went wrong" });
          }
        });
    }
  });
};

// create invoice page
module.exports.Invoice_get = async (req, res) => {
  const Business = await companyRegister.findOne();
  const prud = await Product.find();
  const products = await storeProduct.find({
    WHIDS: new ObjectId(req.params.id),
  });

  const currencies = await fetch('https://gist.githubusercontent.com/manishtiwari25/d3984385b1cb200b98bcde6902671599/raw/c004cf168b4532798361e0aee65f3a5b192136cf/world_currency_symbols.json')
  .then((response)=>{
   return response.json()
  })

  if (ObjectId.isValid(req.params.id)) {
    await WHouse.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (item) => {
        const Cusomers = await customer.find({
          $and: [
            { salesPerson: { $eq: [ObjectId(item.StoreKeeper._id)] } },
            { blocked:false },
          ],
        });


        res.render("createInvoice", {
          wareHouse: item,
          prud,
          Cusomers,
          title: "Vendors",
          name: "BADE",
          products,
          Business,
          currencies
        });
      });
  }
};

//Edit_patch request to update  a WHouse
module.exports.Edit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.WHID)) {
    WHouse.updateOne({ _id: ObjectId(req.params.WHID) }, { $set: req.body })
      .then((result) => {
        res.status(200).json({ result: "Ware House Updated" });
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update Ware House" });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

//edit customer information
module.exports.customerEdit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    await customer
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then((result) => {
        if (result.acknowledged === true) {
          res.status(200).json({ result: "Customer Record Updated" });
        } else {
          throw new Error("something went wrong");
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};

module.exports.stock_get = async (req, res) => {
  const Products = await Product.find();
  const wareHouse = await WHouse.find();
  const Locations = await Location.find()
  const storeProducts = await storeProduct.find();
  const employees = await Employe.find({$and: [
    { status: "active" }]}); ;
  res.render("AllVirtualLocation", {
    Products,
    wareHouse,
    storeProducts,
    employees,
    name: "BADE",
    Locations
  });
};

//create product in storeProduct collection

module.exports.WareHouseStoreage_post = async (req, res) => {
  const { WHIDS, productId } = req.body;

  const wH = await WHouse.findById(ObjectId(req.body.WHIDS));

  if (ObjectId.isValid(WHIDS) && ObjectId.isValid(productId)) {
    try {
      wareHouseProduct = await storeProduct.find({ WHIDS: req.params.WHID });

      let products = wareHouseProduct.filter((product) => {
        return product.productId.toString() === req.body.productId.toString();
      });

      if (products.length > 0) {
        throw new Error("This product has already been added to the store");
      } else {
        async function Register(productId, WHIDS) {
          await Product.findById(productId).then(async (prod) => {
            const vendorNAME = await Vendor.findById(prod.Vendor);
            
            await storeProduct
              .create({
                WHIDS,
                productId,
                ADCcode: prod.ACDcode,
                productName: prod.Name,
                UOM: prod.UMO,
                image: prod.image,
                Vendor: prod.Vendor,
                vendorName: vendorNAME.Name,
                isActivated: true,
                category: prod.category,
                Van_Price: prod.Van_Price,
                Market_Price: prod.Market_Price,
                WareHouse_Price: prod.WareHouse_Price,
                VendorPrice: prod.vendor_Price,
                QrCode:''
              })
              .then(async (registerdProduct) => {
            
                registerdProduct.ActivitiyLog.push({
                  message: `Product registered successfully by Administrator on ${responseDate}`,
                });
                
                wH.Notification.unshift({
                  message: `New product has been created in your inventory catalog by Administrator. on ${responseDate}`,
                });

                 //add qr code
                QRCode.toDataURL(`${url}/api/v1/StoreProduct/${registerdProduct._id}/${wH._id}`,function (err, urls) {
                    registerdProduct.QrCode = urls
                    registerdProduct.save();
                })

                wH.save();

                res.status(200).json({
                  message: `Product registered successfully by Administrator.${wH.WHName}`,
                });
              });
          });
        }

        Register(productId, WHIDS);
      }
    } catch (e) {
      res.status(500).json({ Errormessage: e.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

//add product to ware house to recive array
module.exports.WareHouseStock_post = async (req, res) => {
  //find warehouse from request body
  const { WHName, Batch } = req.body;
  try {
    const w = await WHouse.findOne({ WHName })
      .limit(1)
      .then((item) => {
        const Notification = {
          body: `New batch of ${req.body.Batch.products.length} product was sent to your ware house on ${req.body.Batch.Date}`,
          _id: id,
        };
        item.toRecive.unshift(Batch);
        item.Notification.unshift(Notification);
        item.save();
      })
      .then((result) => {
        res.status(200).json({
          result: `Product has been sent to ${WHName.Manager} for the manager to validate`,
        });
      });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

//VirtualstorageProduct get
module.exports.VirtualstorageProduct_get = async (req, res) => {
  const PurchasedProduct = await Product.find();
  const wareHouse = await WHouse.find();
  const umo = await UMO.find();
  const productcat = await ProductCat.find();
  res.status(200).render("virtualProduct", {
    wareHouse,
    PurchasedProduct,
    umo,
    productcat,
    name: "BADE",
  });
};

//for univesrasl and Ai search
module.exports.query_get = async (req, res, next) => {
  try {
    const openAi = new OpenAIApi(
      new Configuration({
        apiKey: OPEN_AI_API_KEY,
      })
    );

    await openAi
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: req.params.query }],
      })
      .then((response) => {
        res
          .status(200)
          .json({ message: response.data.choices[0].message.content });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ..create bills
module.exports.WareHouseBill_post = async (req, res, next) => {
  try {
    await customer
      .findById(new ObjectId(req.body.customer))
      .then(async (customer) => {
      if (customer.category === "Credit-Customer") {
          await Customer.findById(req.body.customer).then(async (customer) => {
            previousDebt = customer.Debt;
            newDebt = previousDebt + req.body.grandTotal;
            if (newDebt > customer.creditLimit) {
              throw new Error("Customer Bill has exceeded credit Limit ");
            } else {
                previousDebt = customer.Debt;
                newDebt = parseInt(previousDebt) + parseInt(req.body.grandTotal);

                // capture debt days here
                if (newDebt > 0) {
                  await Customer.updateOne({_id: customer._id}, 
                    { $set: { lastPayDate : moment().format("l") }})
                  
                }

                await Customer.updateOne({_id: customer._id}, 
                { $set: { Debt:newDebt }})
                .then(async(acknowledged)=>{
                  if(acknowledged){
                     //generate report for customer
                await CustomerReport.create({
                  ReferenceNo: `INV${req.body.billReferenceNo}`,
                  DebitAmount: req.body.grandTotal,
                  Date: req.body.startDate,
                  customerId: req.body.customer,
                  Balance: newDebt,
                  dr: true,
                  CreditAmount: 0,
                  cr: false,
                });
                next();
                  }else{
                    throw new Error("something went wrong");
                  }
                })
            }
          });
        } else {
          throw new Error(
            `Could not register New Bill. Customer Category is not defined `
          );
        }
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all bills for each ware view
module.exports.WareHouseBill_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const wareHouse = await WHouse.findOne({
      _id: new ObjectId(req.params.id),
    });
    bills
      .find({ whId: new ObjectId(req.params.id) })
      .sort({ startDate: -1 })
      .then(async (Bills) => {
        const customers = await customer.find();
        const whBill = [];
        Bills.forEach((bill) => {
          whBill.push(bill);
        });
        res.status(200).render("Bills", {
          whBill,
          result: wareHouse,
          customersname: "BADE",
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(500).send({ error: "Not a valid doc ID" });
  }
};

//get single bill
module.exports.WareHouseSingleBill_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    const Business = await companyRegister.findOne();
    Singlebill = await bills.findOne({ _id: new ObjectId(req.params.id) });
    if (!Singlebill) {
      res.redirect("/api/v1/404");
    } else {
      await WHouse.findOne({ _id: new ObjectId(Singlebill.whId) }).then(
        async (warehouse) => {
          cust = await customer.findOne({
            _id: new ObjectId(Singlebill.customer),
          });
          res.status(201).render("Singlebills", {
            name: "BADE",
            Singlebill,
            warehouse,
            cust,
            Business,
          });
        }
      );
    }
  }
  next();
};

//approve lpo for managers
module.exports.approveBill_patch = async (req, res, next) => {
 try{
  await PurchaseOrder.findById(req.params.id)
  .then(async (PO)=>{
    await PurchaseOrder.updateOne({_id:req.params.id},{ $set: { status:req.body.status }})
    .then(async(acknowledged)=>{
      if(acknowledged){
        if( req.body.status === 'Accountant Accept'){
          NotifyCFOPO(PO);
          await Vendor.findById(ObjectId(PO.Vendor))
          .then(async vendor =>{
            if(vendor){
              //add the value of lpo to the vandor balance here
              await Vendor.updateOne({_id:vendor._id},{$set:{Balance: vendor.Balance + PO.grandTotal}})
              res.status(200).json({message:`GRN ${req.body.status} has been approved and Vendor Balance has been updated`})
            }else{
              throw new Error("Vendor not found. Balance not updated");
            }
         })

       }else{
        res.status(200).json({message:`You have ${req.body.status} GRN${req.body.status}`})
       }
        
      }else{
        throw new Error("something went wrong");
      }
    })
  })
 }catch(err){
  res.status(503).json({error: err.message})
 }
};

//send mail route to customer
module.exports.sendMail = async (req, res, next) => {
  next();
};

//get single customer information
module.exports.customer_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      await customer
        .findOne({ _id: new ObjectId(req.params.id) })
        .then(async (result) => {
          const employees = await Employe.find({$and: [
            { status: "active" }]}); ;
          const wh = await WHouse.find();
          const Accounts = await Account.find()
          const transcations = await CustomerReport.find({customerId:req.params.id}).sort({createdAt:-1}).limit(30)
          res
            .status(200)
            .render("SingleCustomer", { result, name: "BADE", employees, wh ,Accounts,transcations});
        });
    } catch (error) {
      res.status(404).render("404", { error: error, name: "BADE" });
    }
  } else {
    res.end();
  }
};

// create customer account
module.exports.CustomerRegister_post = async (req, res) => {
  try {
    await customer.create(req.body).then(async (newCustomer) => {
      if (newCustomer) {
        //generate report for customer
        await CustomerReport.create({
          ReferenceNo: `OPENING BALALANCE FOR ${newCustomer.Username.toUpperCase()}`,
          DebitAmount: 0,
          CreditAmount: 0,
          Date: moment().format("l"),
          customerId: newCustomer._id,
          Balance: newCustomer.Debt,
          dr: false,
          cr: false,
        });

        NotifyCustomerCreate(newCustomer); //notify customer creation for activation
        res.status(200).json({
          message:
            "New customer has been registered successfully. the administrator will be notified to assign necessary permissions",
        });
      } else {
        throw new Error("Could not register customer ");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get information
module.exports.vendor_get = async (req, res) => {
  Vendor.findOne({ _id: req.params.id }).then((vendor) => {
    res.status(200).render("singlevendor", { vendor, name: "BADE" });
  });
};

//patch request handler for vendors
module.exports.vendorEdit_patch = async (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    await Vendor.updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then(async (result) => {
        if (result.acknowledged === true) {
          await Vendor.findOne({ id: req.params.id }).then((vend) => {
            vend.ActivityLog.push({ message: `Record ` });
            vend.save();
          });
          res.status(200).json({ result: " Record Updated" });
        } else {
          throw new Error();
        }
      })
      .catch((Error) => {
        res.status(500).json({ error: Error.message });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc ID" });
  }
};



module.exports.paymentRevoke_patch = async (req, res,next) => {
  try {
    const payment = await CreditCustomerPayment.findById(req.params.paymentId);
    if(payment.status !== "posted" && req.query.action === "posted"){
      await CreditCustomerPayment.updateOne({_id:req.params.paymentId},{$set:{status:req.query.action}})
      .then(async acknowledge =>{
        if(acknowledge){
          //find and update customer balance
         const Customer = await customer.findById(payment.customer)

          //clear debt for customer
          let currentDebt = Customer.Debt;
          NewDebt = currentDebt - parseInt(payment.crAmount);
          await customer.updateOne({_id: payment.customer},{$set:{Debt:NewDebt,lastPayDate:payment.PaymentDate}})
          .then( async acknowledge => {
              if(acknowledge){
                //generate report for customer
                await CustomerReport.create({
                  ReferenceNo: `PYMT-${payment.paymentReferenceNo}`,
                  DebitAmount: 0,
                  CreditAmount: parseInt(payment.crAmount),
                  Date: moment().format("l"),
                  customerId: payment.customer,
                  Balance: Customer.Debt - payment.crAmount,
                  dr: false,
                  cr: true,
                });
              }else{
                throw new Error('Failed to update customer Ledger');
              }
          })

          res.status(200).json({message:`Payment has been Approved and customer Balance updated successfully`})
        }else{
          throw new Error('Payment revocation failed');
        }
      })

    }else if(payment.status === "posted" && req.query.action === "Reversed"){
      // revese the payment
      await CreditCustomerPayment.updateOne({_id:req.params.paymentId},{$set:{status:req.query.action}})
      .then(async acknowledge =>{
        if(acknowledge){
          const Customer = await customer.findById(payment.customer)

          //clear debt for customer
          let currentDebt = Customer.Debt;
          NewDebt = currentDebt + parseInt(payment.crAmount);
          await customer.updateOne({_id: payment.customer},{$set:{Debt:NewDebt,lastPayDate:payment.PaymentDate}})
          .then( async acknowledge => {
              if (acknowledge){
                 //generate report for customer
                  await CustomerReport.create({
                    ReferenceNo: `RVSL-${payment.paymentReferenceNo}`,
                    DebitAmount: parseInt(payment.crAmount),
                    CreditAmount:0,
                    Date: moment().format("l"),
                    customerId: payment.customer,
                    Balance: Customer.Debt + payment.crAmount,
                    dr: true,
                    cr: false,
                  });
              }else{
                throw new Error('Failed to update customer Ledger');
              }
           
          })
          res.status(200).json({message: 'Payment Reversed successfully'})
        }else{
          throw new Error('Payment Reversal failed');
        }
      });
    }else{
      await CreditCustomerPayment.updateOne({_id:req.params.paymentId},{$set:{status:req.query.action}})
      .then(async acknowledge =>{
        if(acknowledge){
          res.status(200).json({message:`Payment status has been updated to ${req.query.action}`})
        }else{
          throw new Error('Payment status update failed');
        }
      })
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.RegisterPayment_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.billId)) {
    Singlebill = await bills.findOne({ _id: ObjectId(req.params.billId) });
    const account = await Account.find();
    await WHouse.findOne({ _id: new ObjectId(Singlebill.whId) }).then(
      async (warehouse) => {
        cust = await customer.findOne({
          _id: new ObjectId(Singlebill.customer),
        });
        const Business = await companyRegister.findOne();
        res.status(201).render("RegisterSinglebill", {
          name: "BADE",
          Singlebill,
          warehouse,
          cust,
          account,
          Business,
        });
      }
    );
  }
  next();
};

//export collection to work book spreadsheet  download spread sheet for ALL BILLS list for accountant
module.exports.BillsWorkBook_get = async (req, res, next) => {
  const workBook = XLSX.readFile("workbook.xlsx");

  const data = await bills.find({});

  //conver the xlsx to json format
  let workSheet = {};
  for (const sheetName of workBook.SheetNames) {
    workSheet[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
  }

  workSheet.Sheet1 = []; //clear sheet then populate sheet with new values
  data.forEach((data) => {
    //data from  req.body to register payments for accounting purposes
    workSheet.Sheet1.push({
      _id: `${data._id}`,
      customerId: data.customer.toString(),
      customer: data.customerName,
      "Grand Total (₦)": `₦${parseInt(data.grandTotal)}`,
      "ShippingFee (₦)": `₦${data.shippingFee}`,
      "Start Date": data.startDate,
      "Payment Method": data.paymentMethod,
      Orders: data.orders.length,
      Promotion: data.promotionItems.length,
      Status: data.billStatus,
      "Bank Account": data.bankAccount,
      "Discount %": data.discount,
      "raised By": data.RaiseBy,
      "Registered Balance": `₦${data.registeredBalance}`,
      "Reference No": data.billReferenceNo,
      "Bill Status": data.status,
      AccountantName: data.AccountantName,
    });
  });

  XLSX.utils.sheet_add_json(workBook.Sheets["Sheet1"], workSheet.Sheet1);
  XLSX.writeFile(workBook, "workbook.xlsx");
  res.status(200).download("workbook.xlsx");

  // console.log("json:\n",JSON.stringify(workSheet.Sheet1),"\n\n")
};

//get only product for specific ware house
module.exports.WareHouseStoreage_get = async (req, res, next) => {
  if (ObjectId.isValid(new ObjectId(req.params.whId))) {
    await WHouse.findOne({ _id: new ObjectId(req.params.whId) })
      .limit(1)
      .then(async (item) => {
        const prud = await Product.find();
        products = await storeProduct.find({ WHIDS: new ObjectId(item._id) }).sort({currentQty:-1});
        res.status(200).render("wareHouseProduct", {
          result: item,
          products,
          prud,
          name: "BADE",
        });
      });
  } else {
    res.redirect("/api/v1/404");
  }
};

//update product in ware house product
module.exports.WareHouseStoreage_patch = async (req, res, next) => {
  const { update } = req.body;
  if (ObjectId.isValid(new ObjectId(req.params.whId))) {
    try {
      await storeProduct
        .updateOne({ _id: ObjectId(req.params.whId) }, { $set: update })
        .then(async (product) => {
          if (product.acknowledged) {
            const prod = await storeProduct.findById(req.params.whId);
            prod.ActivitiyLog.unshift({ message: req.body.message });
            prod.save();
            res.status(200).json({ message: "Product updated successfully" });
          } else {
            throw new Error("Something went wrong");
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

//register payment on bill
module.exports.RegisterPayment_patch = async (req, res, next) => {
  const { update } = req.body;
  if (ObjectId.isValid(new ObjectId(req.params.id))) {
    try {
      //first find the bill
      await bills
        .findById(new ObjectId(req.params.id))
        .then(async function (updatedBill) {
          if (updatedBill.grandTotal === parseInt(update.registeredBalance)) {
            await bills
              .updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
              .then(async (bill) => {
                if (bill.acknowledged) {
                  updatedBill.status = "Approved";
                  updatedBill.ActivityLog.unshift({
                    logMsg: `${update.AccountantName} Remarks: (${update.paymentMethod}:₦${update.registeredBalance}) ,${update.remark}.`,
                    status: "Invoiced",
                  });

                  //  create payment
                  await CreditCustomerPayment.create({
                    PaymentDate: responseDate,
                    BillNo: update._id,
                    Accountant: update.AccountantName,
                    bankAccount: update.bankAccount,
                    paymentReferenceNo: updatedBill.PaymentRef,
                    crAmount: update.registeredBalance,
                    drAmount: 0,
                    customer: updatedBill.customer,
                    cr: true,
                    collectionRef: "BILL",
                  }).then((payment) => {
                    if (payment) {
                      // store keeper to release goods
                      NotifyStoreKeeper(updatedBill);
                      updatedBill.save();
                    }
                  });

                  //remove product from warehouse
                  //  updatedBill.orders.forEach(async (order) =>{
                  //    await storeProduct.find({WHIDS: new ObjectId(updatedBill.whId)})
                  //    .then(async(products)=>{
                  //      // filterproducts that are in warehouse to get product to deduct from
                  //      todeduct = products.filter(prud =>{
                  //        return prud.productId.toString() === order.item._id.toString()
                  //       }).map(currentQty=>{return currentQty.currentQty})

                  //       await storeProduct.updateOne({productId:order.item._id},{$set:{currentQty:todeduct - order.Qty}})

                  //   })
                  //  });

                  res.status(200).json({
                    message:
                      "Store keeper will be Notified to Release Goods to Customer",
                  });
                } else {
                  throw new Error("Something seems to be wrong");
                }
              });
          } else {
            throw new Error("Payment must be in full");
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

//FOR DASHBOARD
module.exports.Report_get = async (req, res, next) => {

  //find best selling product
  const Bestproduct = await Product.findOne({$and:[{TotalSale:{$gt:0}}]}).sort({TotalSale:-1})

  //find bill total for current day
  const d = new Date();
  let TodaySale = await bills.find({
    startDate:`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
    billStatus: { $ne: "Cancelled" },
  }).exec().then(bill=>{
    return bill.map(bills =>{return bills.grandTotal})
    .reduce((total, currentValue) => {
      return parseInt(total + currentValue);
    }, 0);
  })

  // get Revenue

  let Revenue =  await CreditCustomerPayment.find({
    PaymentDate: moment().format('YYYY-MM-DD'),
    collectionRef:"PMNT",
    cr: true,
    status:'posted'
  }).exec().then(bill=>{
   return bill.map(payment =>{
      return payment.crAmount
    }).reduce((total, currentValue) => {
      return parseInt(total + currentValue);
    }, 0);
  })

  //  top deptor
  const debtor = await Customer.find(
    {$and:[{Debt:{$gt:0}}]}).sort({Debt:-1}).limit(1).exec()


  //  get all warehouses
  const WH = await WHouse.find();
  res.status(200).render("reports", {
    Bestproduct,
    TodaySale,
    Revenue,
    debtor,
    WH,
    name: "BADE",
  });
};


//get All invoice records in json for business at glance

module.exports.getInvoiceRecords = async (req, res) => {
  const invoices = await bills.find({ billStatus: { $ne: "Cancelled" } });
  const WH = await WHouse.find();
  res.status(200).json({invoices,WH});
};

//get customer report
module.exports.getCustomerReportGenerate = async (req,res) =>{
   //generate date function
   function generateDates(end, start) {
    const dates = [];
    let currentDate = moment(start);
    while (currentDate <= moment(end)) {
      dates.push(currentDate.format('DD-MM-YYYY'));
      currentDate = currentDate.add(1, 'days');
    }
    return dates;
  }

  try{

    //get all employee
    const employee = await Employe.find();
    //get all customers
    const customers = await Customer.find();
    //get all warehouse
    const WH = await WHouse.find();
    
    if(req.query.view === 'all'){
       //filter through retail invoice and return only invoice that is invoice
       const invoice = await CustomerReport.find().exec()
       .then((invoice)=>{
        return invoice.filter(inv =>{
            const dates = generateDates(new Date(req.query.Enddate),new Date(req.query.Startdate))
            const formattedDate = moment(new Date(inv.Date)).format("DD-MM-YYYY");
            return dates.includes(formattedDate);
        })
      })

      if(invoice.length > 0){
        res.status(200).json({invoice,employee,customers,WH})
      }else{
        throw new Error('No Result to display from search parameters')
      }

    }else{
      //search for only the selected customer
       const invoice = await CustomerReport.find().exec()
       .then((invoice)=>{
        return invoice.filter(inv =>{
            const dates = generateDates(new Date(req.query.Enddate),new Date(req.query.Startdate))
            const formattedDate = moment(new Date(inv.Date)).format("DD-MM-YYYY");
            return inv.customerId.toString() === req.query.view && dates.includes(formattedDate);
        })
      })

      if(invoice.length > 0){
        res.status(200).json({invoice,employee,customers,WH})
      }else{
        throw new Error('No Result to display from search parameters')
      }
    }
  }catch(err){
    res.status(503).json({error:err.message})
  }
}

// get all data from database
module.exports.getFullDB = async (req, res) => {
  // get all employee
  const Business = await companyRegister.findOne();
  const StcokCards = await BeamCard.find();
  const Employee = await Employe.find();
  const timeoff = await Timeoff.find()
  const Products = await Product.find();
  const customers = await Customer.find();
  const vendor = await Vendor.find();
  const invoice = await bills.find();
  const payment = await CreditCustomerPayment.find();
  const WH = await WHouse.find();
  const LPO = await PurchaseOrder.find();
  const CustomerReports = await CustomerReport.find();
  const Expenses = await Expense.find();
  const WareHouseProduct = await storeProduct.find();
  const Transfer = await ProductTransfer.find();
  const ExpCat = await ExpenseCat.find();
  const Asset = await Assets.find();
  const vendorBill = await PayVendor.find();
  const Appraisal = await Appraisals.find()
  const Events = await Event.find()
  const Tickets = await Helpdesk.find()
  const SmartInvoice =await AutomatedInvoice.find()
  const priceChange = await HistoricalpriceChange.find()
  const openingStock =  await SkuOpening.find()
  res.status(200).json({
    Employee,
    Products,
    customers,
    vendor,
    invoice,
    Events,
    payment,
    WH,
    LPO,
    CustomerReports,
    Expenses,
    WareHouseProduct,
    Transfer,
    ExpCat,
    Asset,
    vendorBill,
    timeoff,
    Appraisal,
    StcokCards,
    Business,
    Tickets,
    SmartInvoice,
    priceChange,
    openingStock
  });
};

module.exports.CFR_get = async (req, res, next) => {
  res.status(200).render("CashFlowReport", { name: "BADE" });
};

module.exports.BankTransaction_get = async (req, res, next) => {
  accontNumbers = await Account.find();
  bank = await CreditCustomerPayment.find();
  res
    .status(200)
    .render("BankTransaction", { bank, accontNumbers, name: "BADE" });
};

module.exports.SaleReprot_get = async (req, res) => {
  WH = await WHouse.find();
  res.status(200).render("SalesReport", { WH, name: "BADE" });
};

module.exports.CustomerTransaction_get = async (req, res) => {
  const customers = await Customer.find();
  const Business = await companyRegister.findOne();
  res.status(200).render("customerTransaction", { customers, name: "BADE",Business });
};

// DEBTORS REPORT
module.exports.DebtorReprot_get = async (req, res) => {
  const customers = await Customer.find().then((c) => {
    return c.filter((cus) => {
      return cus.Debt > 0;
    });
  });
  res.status(200).render("DebtorReport", { customers, name: "BADE" });
};

// sales dump REPORT
module.exports.SalesDump_get = async (req, res) => {
  const WH = await Vendor.find();
  res.status(200).render("Salesdump", { WH, name: "BADE" });
};

module.exports.LPOReprot_get = async (req, res) => {
  const vendor = await Vendor.find();
  const WH = await WHouse.find();
  res.status(200).render("LPOReport", { vendor, WH, name: "BADE" });
};

// dispatch report
module.exports.DispatchReprot_get = async (req, res) => {
  WH = await WHouse.find();
  res.status(200).render("Dispatch", { WH, name: "BADE" });
};

// stock report
module.exports.StockReprot_get = async (req, res) => {
  WH = await WHouse.find();
  res.status(200).render("StockReport", { WH });
};

//target report
module.exports.TGT_get = async (req, res) => {
  res.status(200).render("TGT", { name: "BADE" });
};

module.exports.ExpenseReport_get = async (req, res) => {
  const expenseCat = await ExpenseCat.find();
  const location = await WHouse.find();
  res
    .status(200)
    .render("ExpenseReport", { expenseCat, location, name: "BADE" });
};



//add product to purchase order
module.exports.PurchaseOrderProductAdd = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.query.po)
    if(po.status === 'Draft'){
      await storeProduct.findById(req.query.product).exec()
    .then(async(product) =>{
      if(product){
        //find the po
       const po = await PurchaseOrder.findById(req.query.po).exec()

        //check if the product is already in the cart
        const existingProduct = po.orders.find((item) => {
          return item.storeproductId.toString() === product._id.toString();
        });

        //action duplicates
       if(existingProduct === undefined) {
        await PurchaseOrder.findByIdAndUpdate(
          req.query.po,
          {
              $push: {
                orders : {
                  item:product,
                  Qty:0,
                  roll:0,
                  total:0,
                  ExpDate:'',
                  Status:'',
                  BatchNo:'',
                  storeproductId:product._id,
                },
              },
          },
          { new: true } // Return the updated document
      );

       res.status(200).json({ message: 'Product added to Purchase Order successfully' });

       }else{
        throw new Error('Invoice update failed. Product already exist in ordered list');
       }

       
      }
    })

    }else{
      throw new Error('Cannot add a product to a finalized invoice');
    }
   
  } catch (err) {
    res.status(500).json({error: err.message});
    
  }
};

//remove line item form LPO 
module.exports.PurchaseOrderProductRemove = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.query.po)
    if(
      po.status === 'Draft'
    ){
      await PurchaseOrder.updateOne(
        { _id: ObjectId(req.query.po) },
        { $pull: { orders: { _id: ObjectId(req.query.items) } } }
      ).exec()
      .then(async acknowledge => {
        if(acknowledge){
          //update the total of the invoice
          const Invoice =  await PurchaseOrder.findById(req.query.po).exec()
          Invoice.grandTotal = Invoice.orders.map(invoice =>{return parseInt(invoice.total)})
          .reduce((total, currentValue) => {
            return parseInt(total + currentValue);
          }, 0);
          Invoice.save()
          res.status(200).json({ message: 'Line item deleted successfully'});
        }else{
          throw new Error('Something went wrong');
        }
      })
    }else{
      throw new Error('Cannot delete a line item on a finalized invoice');
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update qty on lpo invoice line

module.exports.PurchaseOrderProductUpdate = async (req, res, next) => {
  try{
    if(ObjectId.isValid(req.query.po)){

     const selected =  await PurchaseOrder.findById(req.query.po).exec().then((retailInvoice)=>{
        const product = retailInvoice.orders.find((item) => {
          return item._id.toString() === req.query.lineId;
        });
        return product
      })

      //FIND the product in the orderlist

      await PurchaseOrder.updateOne(
        {
          _id: req.query.po,
          "orders._id": req.query.lineId
        },
        {
          $set: {
            "orders.$.Qty": req.query.value,
            "orders.$.total": req.query.value * selected.item.VendorPrice

          }
        },
      ).then(async pro=>{
        if(pro){
          //update invoice total
          const Invoice =  await PurchaseOrder.findById(req.query.po).exec()
          Invoice.grandTotal = Invoice.orders.map(invoice =>{return parseInt(invoice.total)})
          .reduce((total, currentValue) => {
            return parseInt(total + currentValue);
          }, 0);
          Invoice.save()
          res.status(200).json({message: 'Invoice updated successfully'})
        }else{
          throw new Error('Something went wrong')
        }
      })
    }else{
      throw new Error('Invalid Order Id')
    }
  }catch(err){
    res.status(500).json({error: err.message})
  }
}

//update po status to pending for invoicer
module.exports.PurchaseOrderUpdate = async (req,res,next) => {
  try{
    if(ObjectId.isValid(req.query.po)){
      await PurchaseOrder.updateOne(
        { _id: req.query.po },
        { $set: { status: req.body.status ,discount:req.body.discount,
           Remarks:req.body.remark,ReturnQty:req.body.ReturnValue,
           shippingfee:req.body.shippingfee,
          } }
      ).then(async pro=>{
        if(pro){
          const Invoice =  await PurchaseOrder.findById(req.query.po).exec()
          Invoice.grandTotal = Invoice.orders.map(invoice =>{return parseInt(invoice.total)})
          .reduce((total, currentValue) => {
            return parseInt(total + currentValue) 
          }, 0) - Invoice.discount;
          Invoice.save()
          res.status(200).json({message: 'Invoice status updated successfully'})
        }else{
          throw new Error('Something went wrong')
        }
      })
    }else{
      throw new Error('Invalid Order Id')
    }
  }catch(err){
    res.status(500).json({error: err.message})
  }
}

// create lpo 
module.exports.vendorFind_post = async (req, res) => {
 try{
  if (ObjectId.isValid(req.params.id)) {
    await Vendor.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async (item) => {
        if(item){
          await PurchaseOrder.create({
          grandTotal:0,
          shippingFee:0,
          subTotal:0,
          recievedDate:req.body.RecievedDate,
          Vendor:item._id,
          orders:[],
          billStatus:'',
          status:'Draft',
          discount:0,
          taxRate:0,
          salesPerson:'',
          signatureUrl:'',
          ActivityLog:[],
          rejectionReasons:[],
          billReferenceNo : req.body.Ref,
          registeredBilling:0,
          registeredBalance:0,
          PaymentStatus:'',
          PaymentReference:'',
          Attachment:req.body.files,
          WHID:req.body.WHs,
          ReturnQty:0,
          Remarks:'',
          }).then(newBill =>{
            if(newBill){
              res.status(200).json({ message:'New Bill successfully added to Purchase Order. REDIRECTING...',_id:newBill._id});
            }else{
              throw new Error('Something went wrong')
            }
          })
        }else{
          throw new Error('No vendor found')
        }
       
      });
  }else{
    throw new Error('Something went wrong')
  }
 }catch(err){
  req.status(500).json({error: err.message});
 }
};

// aprraisal get
module.exports.Appraisal_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
   const KPIs = await KPI.find().sort({ name: 1 }); 
    await Employe.findOne({ _id: ObjectId(req.params.id) })
      .limit(1)
      .then(async(Employee) => {
      const emApp =  await Appraisals.find({Employe:Employee._id}).sort({createdAt:1})
        res.status(200).render("SingleEmployeeAppraisalList", { Employee, name: "BADE" ,KPIs,emApp});
      });
  } else {
    res.redirect("/api/v1/404");
  }
};


// get single Appraisal
module.exports.SingleAppraisal_get = async (req,res,next)=>{
  if (ObjectId.isValid(req.params.id)) {
    await Appraisals.findById( ObjectId(req.params.id))
     .limit(1)
     .then(async (item) => {
      const Employee = await Employe.findById(new ObjectId(item.Employe));
        res.status(200).render("Appraisal",{ item,Employee,name:'BADE' });
      });
  }
}

//appraisal status change
module.exports.SingleAppraisal_patch = async (req,res)=>{
 try {
  if (ObjectId.isValid(req.params.id)) {
    // check for status
    if(req.query.btnStatus){
      
      await Appraisals.updateOne({ _id: ObjectId(req.params.id) }, { $set: {status:req.query.status,generalRating:req.query.generalRating} })
    .then((acknowledge)=>{
      if(acknowledge){
        res.status(200).json({message:"Appraisal Status Changed Successfully"})
      }else{
        throw new Error('something went wrong')
      }

    })

    }

    // check for employeescore
    if(req.query.employeeScore){
      // uddate kpi field for employee score
      await Appraisals.updateOne(
        {
          _id: req.params.id,
          "kpi._id": req.query.kpiid,
        },
        {
          $set: {
            "kpi.$.employeeScore": req.body.score
          }
        },
      ).then(acknowledge=>{
        if(acknowledge){
          res.status(200).json({message:'Updated'})
        }else{
          throw new Error('Something went Wrong')
        }
      })
    }

    // update manager fscore fireld
    if(req.query.managerScore){
      // uddate kpi field for employee score
      await Appraisals.updateOne(
        {
          _id: req.params.id,
          "kpi._id": req.query.kpiid,
        },
        {
          $set: {
            "kpi.$.Manager_Score": req.body.score,
            "kpi.$.Rating": req.query.Avg
          }
        },
      ).then(acknowledge=>{
        if(acknowledge){
          res.status(200).json({message:'Updated'})
        }else{
          throw new Error('Something went Wrong')
        }
      })
    }

    // comment from HR, EMPLOYEE AND MANAGER
    if(req.query.who ==='ManagerComment'){
      
      await Appraisals.updateOne({ _id: ObjectId(req.params.id) }, { $set: {ManagerComment:req.body.comments,generalRating:req.query.generalRating} })
      .then((acknowledge)=>{
        if(acknowledge){
          res.status(200).json({message:"Manager comment saved"})
        }else{
          throw new Error('something went wrong')
        }
  
      })

    }else if(req.query.who ==='HR'){

      await Appraisals.updateOne({ _id: ObjectId(req.params.id) }, { $set: {HrCommnet:req.body.comments,generalRating:req.query.generalRating} })
      .then((acknowledge)=>{
        if(acknowledge){
          res.status(200).json({message:"Comment saved"})
        }else{
          throw new Error('something went wrong')
        }
  
      })

    }else if (req.query.who ==='Employee'){

      await Appraisals.updateOne({ _id: ObjectId(req.params.id) }, { $set: {employeComment:req.body.comments,generalRating:req.query.generalRating} })
      .then((acknowledge)=>{
        if(acknowledge){
          res.status(200).json({message:"Comment saved"})
        }else{
          throw new Error('something went wrong')
        }
  
      })

    }
    
  }
 } catch (error) {
  res.status(500).json({error: error.message})
 }
}
// sends json response for single employee
module.exports.WareHouseManager_get = async (req, res) => {
  const employee = await Employe.findById(new ObjectId(req.params.employeeId));
  res.status(200).json(employee);
};

module.exports.Appraisal_post = async (req, res) => {
  try {
    if (ObjectId.isValid(req.body.Employe)) {
    await Appraisals.create(req.body).then(async (data) => {
      if(data) {
        await Employe.updateOne( { _id: ObjectId(data.Employe) },
        { $set: { Appraisal: `${data.StartDate}` } })
        AppraisalNotify(data)
        res.status(200).json({ message: "Appraisal Submited Successfully" });
      }
     });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  
};

module.exports.AppraisalsManagement_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
     
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.Appraisal =  await Employe.find({$and: [
      { status: "active" }]})
      .sort({ firstName: 1 })
      .limit(limit)
      .skip(startIndex)
      .exec()
      .then((bills) => {
        if (req.query.category === "all") {
          return bills;
        } else {
          return bills.filter((bill) => {
            return (
              bill.status.toLowerCase() === req.query.category.toLowerCase()
            );
          });
        }
      });

    if (endIndex < (await bills.find().countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.Previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.KPI = await KPI.find().sort({ name: 1 }); 

    results.currentPage = req.query.page;
    results.currentCat = req.query.category;

    res.status(200).render("AppraisalsManagement", {
      results,
      name: "BADE",
    });
  }
};

// //for expense controller
// module.exports.expense_get = async (req, res, next) => {
//   if (ObjectId.isValid(req.params.WHID)) {
//     await WHouse.findOne({ _id: new ObjectId(req.params.WHID) })
//       .limit(1)
//       .then(async (item) => {
//         const expenseCat = await ExpenseCat.find();
//         const Expenses = await Expense.find({ WHID: new ObjectId(item._id) });
//         const employee = await Employe.findOne(Expenses.initiatorId);
//         res.status(200).render("Expense", {
//           result: item,
//           Expenses,
//           employee,
//           expenseCat,
//           name: "BADE",
//         });
//       });
//   } else {
//     res.redirect("/api/v1/404");
//   }
// };

//post request for expense
module.exports.expense_post = async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      await Expense.create(req.body).then((expense) => {
        if (expense) {
          NotifyCFO(expense);
          res.status(200).json({
            message: `CFO will be notified of expense No: ${expense.refNo} Validation`,
          });
        } else {
          throw new Error("Could not create. Something went wrong");
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

module.exports.scrap_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    try {
      await WHouse.findOne({ _id: new ObjectId(req.params.WHID) })
        .limit(1)
        .then(async (item) => {
          const Scraps = await Scrap.find({ WHID: item._id });
          const prud = await Product.find();
          const products = await storeProduct.find({ WHIDS: req.params.WHID });
          res.status(200).render("Scrap", {
            result: item,
            Scraps,
            prud,
            products,
            name: "BADE",
          });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

//patch for scraping
module.exports.SingleScrap_patch = async (req, res, next) => {
  if (ObjectId.isValid(req.params.ID)) {
    try {
      await Scrap.updateOne(
        { _id: ObjectId(req.params.ID) },
        { $set: { status: `${req.body.status}` } }
      ).then((acknowledged) => {
        acknowledged ? next() : new Error(`Something went Wrong`);
      });
    } catch (e) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports.Scrap_post = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHMANAGER)) {
    try {
      await Scrap.create(req.body).then((scraped) => {
        scraped ? next() : new Error("UNABLE TO CREATE");
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

//GET ROUTE FOR WHOUSE STAF
module.exports.staff_get = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    const Employee = await Employe.find({$and: [
      { status: "active" },
      { workLocation: req.params.WHID }]}); 
    res.status(200).render("wareHouseStaff", { Employee, name: "BADE" });
  } else {
    res.redirect("/api/v1/404");
  }
};

//GET ROUTE FOR REPLENISH
module.exports.replenish_storeproduct = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    const prud = await Product.find();
    const products = await storeProduct.find({ WHIDS: req.params.WHID });
    res
      .status(200)
      .render("wareHouseReplenish", { products, prud, name: "BADE" });
  } else {
    res.redirect("/api/v1/404");
  }
};

//ware house stock request get
module.exports.wareHouse_BeamCard = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    const result = await WHouse.findById(new ObjectId(req.params.WHID));
    const products = await storeProduct.find({ WHIDS: req.params.WHID });

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.BeamCard =  await BeamCard.find({WHID:req.params.WHID})
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(startIndex)
      .exec()
      .then((bills) => {
          return bills;
      });

    if (endIndex < (await BeamCard.find().countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.Previous = {
        page: page - 1,
        limit: limit,
      };
    }


    results.currentPage = req.query.page;

    res.status(200).render("BeamCard", {
      results,
      name: "BADE",
      products,
      result
    });

  } else {
    res.redirect("/api/v1/404");
  }
};

module.exports.StockRequest_post = async (req, res, next) => {
  await StockRequest.create(req.body).then((request) => {
    if (request) {
      next();
    } else {
      res.status(500).json({ error: "Bad request, Something went wrong" });
    }
  });
};

module.exports.WareHouseSetup_get = async (req, res) => {
  if (ObjectId.isValid(req.params.WHID)) {
    const warehouse = await WHouse.findById(new ObjectId(req.params.WHID));
    const Products = await Product.find();
    const purchaseOrder = await PurchaseOrder.find();
    const location = await Location.find()
    const employe = await Employe.find({$and: [
      { status: "active" },
      { workLocation: req.params.WHID }]}); 

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    result.storeProducts = await storeProduct.find({
      WHIDS: new ObjectId(req.params.WHID),
    })
      .sort({ currentQty: -1 })
      .limit(limit)
      .skip(startIndex)
      .exec();

    if (endIndex < (await storeProduct.find({
      WHIDS: new ObjectId(req.params.WHID),
    }).countDocuments().exec())) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      result.Previous = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).render("SetupWarehouse", {
      warehouse,
      result,
      Products,
      purchaseOrder,
      employe,
      location,
      name: "BADE",
    });
  }
};

// send product to different warehouse inventory
module.exports.Inventory_patch = async (req, res, next) => {
  if (ObjectId.isValid(req.params.WHID)) {
    const pendings = req.body;
    const product = await Product.findById(req.params.STOREID);
    const wh = await WHouse.findById(req.params.WHID);

    await storeProduct
      .updateOne({ _id: ObjectId(req.params.PRODID) }, { $set: pendings })
      .then(async (response) => {
        if (response.acknowledged) {
          log = await storeProduct.findById(req.params.PRODID);
          log.ActivitiyLog.unshift({
            message: `${req.body.pendings} ${
              product.UMO
            } was transfered From virtual ware house on ${new Date(
              Date.now()
            ).toLocaleString()} with batch ref ${req.body.Batch_Ref}`,
          });
          log.save();
          product.virtualQty = product.virtualQty - log.pendings;
          product.ActivityLog.unshift({
            message: `${req.body.pendings} ${product.UMO} was transfered to ${
              wh.WHName
            } on ${new Date(Date.now()).toLocaleString()} with batch ref ${
              req.body.Batch_Ref
            }`,
          });
          product.save();
          res.status(200).json({
            message: `New batch transfered to ${wh.WHName} sucessfully `,
          });
        } else {
          res.status(500).json({ error: `Something went wrong` });
        }
      });
  } else {
    res.redirect("/api/v1/404");
  }
};

// virtual ware house routes
module.exports.virtual_get = async (req, res, next) => {
  res.status(200).render("virtual", { name: "BADE" });
};

//VIRTUAL
module.exports.virtual_Scrap = async (req, res, next) => {
  const Scraps = await Scrap.find();
  const Products = await Product.find();
  const wH = await WHouse.find();
  res
    .status(200)
    .render("Virtualscrap", { Scraps, wH, Products, name: "BADE" });
};

module.exports.SingleScrap_get = async (req, res) => {
  try {
    const scraps = await Scrap.findById(new ObjectId(req.params.ID)).then(
      async (scrap) => {
        await storeProduct
          .findById(new ObjectId(scrap.storeProductId))
          .then(async (store) => {
            const products = await Product.findById(
              new ObjectId(store.productId)
            );
            res
              .status(200)
              .render("SingleScrap", { products, scrap, name: "BADE" });
          });
      }
    );
  } catch (error) {
    error ? res.redirect("/api/v1/404") : "";
  }
};

//expense get for cfo
module.exports.CFexpense_get = async (req, res) => {
  
  const WHID = await WHouse.find();
  const expenseCat = await ExpenseCat.find().sort({NAME:1});
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.Expenses = await Expense.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await PurchaseOrder.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const searchAllExpense = await Expense.find();
  
  res.render("CFexpense", {
    result,
    searchAllExpense,
    WHID, 
    expenseCat, 
    name: "BADE"
  });
}

// delete route for expense category
module.exports.ExpenseCategory_delete = async (req,res,next)=>{
  await ExpenseCat.deleteOne({_id:req.query.id}).then(acknowledge =>{
    if(acknowledge)  res.redirect(`/api/v1/CFO/EXPENSE/${req.query.userId}?page=1&limit=9`);
  })
}

//for cfr return route
module.exports.CFOReturns_get = async (req, res) => {

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.returns = await Returns.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Returns.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const searchAllPurchase = await Returns.find();
  res.status(200).render("CFORETURNS", { result ,searchAllPurchase, name: "BADE" });
};

//get request for single rehturns
module.exports.SingleReturns_get = async (req, res) => {
  try {
    await Returns.findById(req.params.RETURNID).then(async (SingleReturn) => {
      const WH = await WHouse.findById(new ObjectId(SingleReturn.WHId));
      if (SingleReturn) {
        res
          .status(200)
          .render("SingleReturns", { SingleReturn, WH, name: "BADE" });
      } else {
        res.status(404);
      }
    });
  } catch (err) {
    res.redirect("/api/v1/404");
  }
};

//patch for returns on invoice
module.exports.SingleReturns_patch = async (req, res, next) => {

  try {
    
    await Returns.findById(req.body.id).then(async (crditNote) => {
      const Bill = await bills.findById(crditNote.BillId);
      
          Bill.orders.forEach(async (order) => {
           
            const PreviousValue = await storeProduct.findById(order.storeProductId)

            if (order.scale === "Carton") {
 
            await storeProduct.updateOne({ _id: ObjectId(order.storeProductId )},
             { $set: { currentQty:PreviousValue.currentQty + order.Qty }})
             .then(async (acknowledged) => {
  
              if(acknowledged){
                 
                // CHange status of the product to WHIN
                await bills.updateOne(
                  {
                    _id: ObjectId(crditNote.BillId),
                    "orders.storeProductId": order.storeProductId
                  },
                  {
                    $set: {
                      "orders.$.returnId": 'WH/IN'
                    }
                  },
                )
  
              }
  
             })//update function block ends here
  
             
              // decrease sales count
              await Product.findById(order.item._id).then((productSold) => {
                currentTotalSale = productSold.TotalSale;
                productSold.TotalSale = currentTotalSale - order.Qty;
                productSold.save();
              });

            }else if(order.scale === "Roll"){
               //deduct and action carton removal and rolls
               const RemoveRolls = async (order) => {
                await storeProduct
                  .findById(order.storeProductId)
                  .then(async (product) => {
                    product.Rolls = product.Rolls + order.Qty;
                    product.save();

                     // CHange status of the product to WHIN
                await bills.updateOne(
                  {
                    _id: ObjectId(crditNote.BillId),
                    "orders.storeProductId": order.storeProductId
                  },
                  {
                    $set: {
                      "orders.$.returnId": 'WH/IN'
                    }
                  },
                )
                  });
              };
              RemoveRolls(order);

            }else{
              await storeProduct.updateOne({_id:ObjectId(order.storeProductId)},{ $set: {currentQty:PreviousValue.currentQty + order.Qty ,Rolls:PreviousValue.Rolls + order.ROLQTY}})
              .then(async (acknowledged) => {
  
                if(acknowledged){
                   
                  // CHange status of the product to WHIN
                  await bills.updateOne(
                    {
                      _id: ObjectId(crditNote.BillId),
                      "orders.storeProductId": order.storeProductId
                    },
                    {
                      $set: {
                        "orders.$.returnId": 'WH/IN'
                      }
                    },
                  )

                   // decrease sales count
                    await Product.findById(order.item._id).then((productSold) => {
                      currentTotalSale = productSold.TotalSale;
                      productSold.TotalSale = currentTotalSale - order.Qty;
                      productSold.save();
                    });
    
                }
    
               })//update function block ends here
            }
  
          })//foreach scope ends here

          Bill.ActivityLog.unshift({
            logMsg: `Return Approved on ${responseDate}`,
            status: "Cancelled",
          });
          Bill.billStatus = "Cancelled";
          Bill.save();

          next()
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// lading page for accountants
module.exports.paymentLanging_get = async (req, res) => {
  res.status(200).render("AccountantLanding", { name: "BADE" });
};

// p&l route
module.exports.pnl_get = async (req, res) => {
  const Business = await companyRegister.findOne();
  const location = await Location.find()
  const vendors = await Vendor.find()
  res.status(200).render("P&L", { name: "BADE" ,Business,location,vendors});
};

//purchase lading page
module.exports.PurchaseLanding_get = async (req, res) => {
  res.status(200).render("PurchaseLanding", { name: "BADE" });
};

// purchase controllers
module.exports.PurchaseRequestForm_get = async (req, res, next) => {
  const Business = await companyRegister.findOne();
  const WH = await WHouse.find();
  const vendor = await Vendor.find();
  const products = await Product.find();
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.purchaseOrder = await PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await PurchaseOrder.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const searchAllPurchase = await PurchaseOrder.find();
  
  res.render("PurchaseRequestForm", {
    name: "BADE",
    vendor,
    products,
    Business,
    WH,
    result,
    searchAllPurchase,
  });
};

// GET ALL PR VIA WAREHOUSE
module.exports.purchaseRequest_get = async (req, res) => {
  const result = await WHouse.findById(req.params.whid);
  await StockRequest.find({ WHID: req.params.whid }).then((requests) => {
    res.render("warehousePR", { name: "BADE", requests, result });
  });
};





module.exports.PurchaseRequest_get = async (req, res, next) => {
  const Requests = await StockRequest.find();
  const wareHouse = await WHouse.find();
  res
    .status(200)
    .render("PurchaseRequest", { name: "BADE", Requests, wareHouse });
};


// VendorPayment_get
module.exports.VendorPayment_get = async (req, res) => {
  const VENDOR = await Vendor.find();
  const Acconuts = await Account.find();
  const customers = await Customer.find();
  const VendorReports = await PayVendor.find();
  const wareHouse = await Location.find();
  const po = await PurchaseOrder.find({$and:[{status:"POSTED TO WAREHOUSE"},{StoreKeeperConfirmation:true}]}).exec();
  res.status(200).render("VendorPayment", {
    name: "BADE",
    VENDOR,
    Acconuts,
    VendorReports,
    customers,
    po,
    wareHouse
  });
};

// post route for payment from vendor to customer
module.exports.INCENTIVEPayment_post = async (req, res, next) => {
  try {
    await Vendor.findById(req.body.Vendor).then(async (vendor) => {
      await Vendor.updateOne(
        { _id: req.body.Vendor },
        {
          $set: {
            Bouns: parseInt(vendor.Bouns) - parseInt(req.body.INCENTIVE),
          },
        }
      ).then(async (acknowledged) => {
        if (acknowledged) {
          const customer = await Customer.findById(req.body.customer);
          await Customer.updateOne(
            { _id: req.body.customer },
            {
              $set: {
                Debt: parseInt(customer.Debt) - parseInt(req.body.INCENTIVE),
              },
            }
          ).then(async (acknowledged) => {
            if (acknowledged) {
              // get updated customer balance
              const Updatedcustomer = await Customer.findById(
                req.body.customer
              );

              //find the vendor
              let vendor = await Vendor.findById(req.body.Vendor);

              //generate report for customer
              await CustomerReport.create({
                ReferenceNo: `${req.body.paymentReferenceNo}-(${vendor.Name})`,
                CreditAmount: req.body.INCENTIVE,
                Date: req.body.PaymetDate,
                customerId: customer._id,
                Balance: Updatedcustomer.Debt,
                cr: true,
                DebitAmount: 0,
                dr: false,
              });

              //generate vendor report
              await PayVendor.create({
                billReferenceNo: `${req.body.paymentReferenceNo}-(${customer.Username})`,
                AccountatntId: req.body.Accountant,
                Amount: req.body.INCENTIVE,
                vendor: req.body.Vendor,
                customer: customer._id,
                dr: true,
                cr: false,
                Balance: parseInt(vendor.Bouns),
                PaymentDate: req.body.PaymetDate,
              });
              next(); // send mail to customer and response to client
            } else {
              throw new Error(
                "Something went Wrong, Could not register payment"
              );
            }
          });
        } else {
          throw new Error("Something went Wrong, Could not register payment");
        }
      });
    });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
};

// register payment from vendor
module.exports.VendorBalance_patch = async (req, res, next) => {
  try {
    if (ObjectId.isValid(req.body.Vendor)) {
      await Vendor.findById(req.body.Vendor).then(async (vendor) => {
        await Vendor.updateOne(
          { _id: vendor._id },
          {
            $set: {
              Bouns: parseInt(vendor.Bouns) + parseInt(req.body.INCENTIVE),
            },
          }
        ).then(async (acknowledged) => {
          if (acknowledged) {
            //find the updated vendor
            let UPDATEDvendor = await Vendor.findById(req.body.Vendor);

            //generate vendor report
            await PayVendor.create({
              billReferenceNo: `${req.body.paymentReferenceNo}-(${vendor.Name})`,
              AccountatntId: req.body.Accountant,
              Amount: req.body.INCENTIVE,
              vendor: req.body.Vendor,
              customer: customer._id,
              dr: false,
              cr: true,
              Balance: UPDATEDvendor.Bouns,
              PaymentDate: req.body.PaymetDate,
              location: req.body.location
            });
            res.status(200).json({ message: "Payment registered successful" });
          } else {
            throw new Error("Payment not registered");
          }
        });
      });
    } else {
      throw new Error("not a matching ID");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REVERE VENDOR PAYMENT OR BACK TO VENDOR ACCOUNT
module.exports.VendorPayment_Patch = async (req, res) => {
  if (ObjectId.isValid(req.params.paymentId)) {
    const User = await Employe.findById(req.body.id);
    try {
      await PayVendor.findById(req.params.paymentId).then(async (payment) => {
        if (payment.status !== "Posted") {
          throw new Error("This Payment has alreay been reversed");
        } else if (payment.dr) {
          await Vendor.findById(payment.vendor).then(async (vendor) => {
            await Customer.findById(payment.customer).then(async (customer) => {
              await Customer.updateOne(
                { _id: customer._id },
                {
                  $set: {
                    Debt: parseInt(customer.Debt) + parseInt(payment.Amount),
                  },
                }
              ).then(async (acknowledged) => {
                if (acknowledged) {
                  vendor.Balance =
                    parseInt(vendor.Balance) - parseInt(payment.Amount);
                  vendor.save();
                  const UPDATEDvendor = await Vendor.findById(payment.vendor);
                  const Updatedcustomer = await Customer.findById(customer._id);
                  payment.status = "Reversed";

                  //generate vendor report
                  await PayVendor.create({
                    billReferenceNo: `REVERSED-${customer.Username}-(${vendor.Name})`,
                    AccountatntId: `${User.firstName} ${User.lastName}`,
                    Amount: payment.Amount,
                    vendor: vendor._id,
                    customer: customer._id,
                    dr: false,
                    cr: true,
                    Balance: UPDATEDvendor.Balance,
                    PaymentDate: req.body.date,
                    status: "Reversed",
                  });

                  //generate report for customer
                  await CustomerReport.create({
                    ReferenceNo: `REVERSED-${Updatedcustomer.Username}-(${vendor.Name})`,
                    CreditAmount: 0,
                    Date: req.body.date,
                    customerId: customer._id,
                    Balance: Updatedcustomer.Debt,
                    cr: false,
                    DebitAmount: payment.Amount,
                    dr: true,
                  });
                  payment.save();
                  res
                    .status(200)
                    .json({ message: "Reverse completed successfully " });
                }
              });
            });
          });
        } else if (payment.cr) {
          // reverse vendor balance registered
          await Vendor.findById(payment.vendor).then(async (vendor) => {
            vendor.Balance =
              parseInt(vendor.Balance) - parseInt(payment.Amount);
            vendor.save();
            payment.status = "Reversed";
            payment.save();
            const UPDATEDvendor = await Vendor.findById(payment.vendor);
            await PayVendor.create({
              billReferenceNo: `REVERSED-BALANCE-(${vendor.Name})`,
              AccountatntId: `${User.firstName} ${User.lastName}`,
              Amount: payment.Amount,
              vendor: vendor._id,
              customer: customer._id,
              dr: true,
              cr: false,
              Balance: UPDATEDvendor.Balance,
              PaymentDate: req.body.date,
              status: "Reversed",
            });
            res
              .status(200)
              .json({ message: "Vendor Balance Reverse successfully" });
          });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// register vendor bills
module.exports.CFOVendorBill_patch = async (req, res, next) => {
  
  const vendorBill = await PurchaseOrder.findById(req.params.BillId);

  if (vendorBill.StoreKeeperConfirmation === false) {
    try {
      if (req.body.status === "Approved") {
        await PurchaseOrder.updateOne(
          { _id: ObjectId(req.params.BillId) },
          { $set: req.body }
        ).then(async (acknowledged) => {
          if (acknowledged) {
            const account = await Account.findOne({
              bankCode: req.body.bankAccount,
            });
            newBalance = account.Balance - parseInt(req.body.AmountPaid);
            account.Balance = parseInt(newBalance);
            account.save();
            await Account.updateOne(
              { _id: ObjectId(account._id) },
              { $set: { Balance: parseInt(newBalance) } }
            );
            // register payment method to bank journal
            await CreditCustomerPayment.create({
              PaymentDate: req.body.PaymentDate,
              Accountant: req.body.CFO,
              bankAccount: req.body.bankAccount,
              BillNo: vendorBill._id,
              paymentReferenceNo: req.body.PaymentRef,
              drAmount: req.body.AmountPaid,
              crAmount: 0,
              dr: true,
              collectionRef: "VNB",
              previousBalance: parseInt(newBalance),
            }).then(async (payment) => {
              if (payment) {
                const vendor = Vendor.findById(vendorBill.Vendor);
                // generate vendor transaction
                await PayVendor.create({
                  billReferenceNo: `VND-PYMT-${req.body.PaymentRef}/${vendorBill.billReferenceNo}`,
                  AccountatntId: req.body.CFO,
                  Amount: req.body.AmountPaid,
                  vendor: vendorBill.Vendor,
                  customer: vendorBill.Vendor,
                  dr: false,
                  cr: true,
                  PaymentDate: req.body.PaymentDate,
                  status: "Payment",
                  location: vendorBill.WHID,
                  Balance: parseInt(vendor.Balance) - parseInt(req.body.AmountPaid)
                });

                order = await PurchaseOrder.findById(
                  ObjectId(req.params.BillId)
                );
                order.ActivityLog.unshift({
                  logMsg: `Purchase Order Approved`,
                  status: `${req.body.status}`,
                });
                order.save();
                payment
                  ? NotifyStoreKeeperPO(vendorBill)
                  : new Error("payment Registration Failed");
                res.status(200).json({
                  message:
                    "Payment Registration Successful. Notification has been sent to WareHouse Store Keeper",
                });
              } else {
                throw new Error("payment Registration Failed");
              }
            });
          }
        });
      } else if (req.body.status === "Declined") {
        order = await PurchaseOrder.findById(ObjectId(req.params.BillId));
        order.ActivityLog.unshift({
          logMsg: `${req.body.RejectionReason}`,
          status: `${req.body.status}`,
        });
        order.save();
        NotifyInvoicerPODeclined(vendorBill, "CFO");
        //update the vendors balance
        Vendor.findById(vendorBill.Vendor)
        .then((vendor) =>{
          Vendor.updateOne({_id:vendor._id},{$set:{Balance:vendor.Balance - order.grandTotal }})
        })
        //delete the lpo
        await PurchaseOrder.deleteOne({ _id: ObjectId(req.params.BillId) });
        res.status(500).json({
          deleteMessage: `Response Acknowledged. Invoicer will be Notified to Check for ${req.body.RejectionReason}. Please Note that the LPO will be deleted and vendor balance Updated `,
        });
      } else if (req.body.StoreKeeperConfirmation === true) {
        //approve for store keeper confirmation

        for (let index = 0; index < vendorBill.orders.length; index++) {
          const element = vendorBill.orders[index];
          
          const product = await storeProduct.findById(element.storeproductId);
          const update = product.currentQty + element.Qty;
          await storeProduct.updateOne(
            { _id: ObjectId(element.storeproductId) },
            {
              $set: {
                currentQty: update,
                ExpDate: element.ExpDate,
                BatchNo: element.BatchNo,
                LastBatchDate: vendorBill.recievedDate,
              },
            }
          ).then(async (acknowledge)=>{
            if(acknowledge){
               // for tracebility
               await PurchaseOrder.updateOne(
                {
                  _id: ObjectId(vendorBill._id),
                  "orders.storeproductId": element.storeproductId
                },
                {
                  $set: {
                    "orders.$.Status": 'WH/IN'
                  }
                },
              )
            }
          });

          product.ActivitiyLog.unshift({
            message:` ${element.Qty}Carton(s) Was registered into Inventory on ${responseDate}. with P.O ref: ${vendorBill.billReferenceNo}`,
          });
          product.save();
          
        }
        // notify cfo email
        // NotifyCFOPO(vendorBill)
        vendorBill.StoreKeeperConfirmation = true;
        vendorBill.status = "POSTED TO WAREHOUSE";
        vendorBill.save();
        res
          .status(200)
          .json({ message: `Product quantity updated successfully.` });
      } else if ((req.body.status = "Declined By StoreKeeper")) {
        vendorBill.status = "Declined By StoreKeeper";
        vendorBill.save();
        //  reject for store keeper
        NotifyInvoicerPODeclined(vendorBill, "StoreKeeper");
        throw new Error(
          "Invoicer will be notified of your Recjection. Please Ensure to call the Invoicer to Discuss your Concerns"
        );
      } else {
        throw new Error("Something seems Wrong");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json({ error: "This PO has already been Reviewed" });
  }
};

// register vendor payment

module.exports.CFOVendorPayment_post = async (req, res, next) => {
  try {
    await Vendor.findById(req.body.VENDORCODE).then(async (vendor)=>{
      //update vendor balance by deducting req.body.Amount form vendor Balance
      Vendor.updateOne({_id: vendor._id},{$set:{Balance:vendor.Balance - req.body.Amount}})
      // register payment method to bank journal
      await CreditCustomerPayment.create({
        PaymentDate: req.body.DATE,
        Accountant: req.query.user,
        bankAccount: req.body.bankAccount,
        BillNo: vendorBill._id,
        paymentReferenceNo: req.body.PaymentRef,
        drAmount: req.body.Amount,
        crAmount: 0,
        dr: true,
        collectionRef: "VNB",
        previousBalance: parseInt(newBalance),
      }).then(async (payment) => {
        if (payment) {
          const vendor = Vendor.findById(vendorBill.Vendor);
          // generate vendor transaction
          await PayVendor.create({
            billReferenceNo: `VND-PYMT-${req.body.PaymentRef}/${vendorBill.billReferenceNo}`,
            AccountatntId: req.query.user,
            Amount: req.body.Amount,
            vendor: vendor._id,
            customer: vendorBill.Vendor,
            dr: false,
            cr: true,
            PaymentDate: req.body.PaymentDate,
            status: "Payment",
            location: req.body.WAREHOUSE,
            Balance: parseInt(vendor.Balance) - parseInt(req.body.Amount)
          });
        }
      });
 
    })
  }catch (err){

  }
}

// get single PO
module.exports.SinglePurchasebillReferenceNo_get = async (req, res, next) => {
  try {
    const Business = await companyRegister.findOne()
    await PurchaseOrder.findById(req.params.billReferenceNo).then(
      async (Singlebill) => {
        const vendor = await Vendor.findById(new ObjectId(Singlebill.Vendor));
        const WH = await WHouse.findById(new ObjectId(Singlebill.WHID));
        const Acconuts = await Account.find();
        const Products = await storeProduct.find({$and:[{Vendor:vendor._id},{WHIDS:Singlebill.WHID},{isActivated:true}]}).sort({productName:1})
        res.status(200).render("SinglePurchaseBillReference", {
          name: "BADE",
          Singlebill,
          vendor,
          Acconuts,
          WH,
          Business,
          Products
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// patch to return back to virtual warehouse
module.exports.ProductReturn_patch = async (req, res, next) => {
  try {
    virtualStorageQty = await Product.findById(req.params.id);
    const wH = await WHouse.findById(req.body.WHIDS);
    const storeProd = await storeProduct.findById(req.body.storeProductId);

    const update =
      parseInt(virtualStorageQty.virtualQty) + parseInt(req.body.virtualQty);
    await storeProduct.updateOne(
      { _id: ObjectId(req.body.storeProductId) },
      { $set: { pendings: 0 } }
    );
    await Product.updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: { virtualQty: update } }
    );
    virtualStorageQty.ActivityLog.unshift({
      message: `${wH.WHName} Returned ${req.body.virtualQty}${virtualStorageQty.UMO} on ${responseDate} new Virtual QTY is now ${update}`,
    });
    storeProd.ActivitiyLog.unshift({
      message: `Returned ${req.body.virtualQty}${virtualStorageQty.UMO} back to Virtual warehouse on ${responseDate}`,
    });
    storeProd.save();
    virtualStorageQty.save();

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//cfo expense get
module.exports.SingleExpense_get = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const Accounts = await Account.find();
      await Expense.findById(new ObjectId(req.params.id)).then(
        async (expense) => {
          const wH = await WHouse.findById(expense.WHID);
          res
            .status(200)
            .render("SingleExpense", { name: "BADE", expense, wH, Accounts });
        }
      );
    } catch (error) {
      console.log(error);
    }
  } else {
    res.end();
  }
};

//SingleExpense_patch REGISTER PAYMENT ON EXPENSE
module.exports.SingleExpense_patch = async (req, res) => {
  try {
    await Expense.updateMany(
      { _id: ObjectId(req.params.EXPID) },
      { $set: req.body }
    ).then(async (update) => {
      if (update) {
        const expense = await Expense.findById(req.params.EXPID);
        const account = await Account.findOne({
          bankCode: req.body.BankAccount,
        });
        newBalance = account.Balance - expense.Amount;
        await Account.updateOne(
          { _id: ObjectId(account._id) },
          { $set: { Balance: newBalance } }
        );
        await CreditCustomerPayment.create({
          PaymentDate: expense.paymentDate,
          Accountant: expense.Accountant,
          bankAccount: expense.BankAccount,
          paymentReferenceNo: req.body.PaymentRef,
          drAmount: expense.Amount,
          crAmount: 0,
          BillNo: expense._id,
          dr: true,
          collectionRef: "EXP",
          previousBalance: newBalance,
        }).then((payments) => {
          if (payments) {
            res.status(200).json({ message: "Payment recorded sucessfully." });
          }
        });
      } else {
        throw new Error("Something went wrong");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//send json for credit payments

module.exports.creditPaymentsJson_get = async (req, res) => {
  const creditPaymentsJson = await CreditCustomerPayment.find({
    collectionRef: "PMNT",
  });
  res.status(200).json(creditPaymentsJson);
};


///Credit/customers get
module.exports.CreditCustomers_get = async (req, res) => {
  const creditCustomes = await customer.find({blocked: false});
  const Acconuts = await Account.find();

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.creditPayment = await CreditCustomerPayment.find({collectionRef:'PMNT'})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await CreditCustomerPayment.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }


  res.status(200).render("CreditPayment", {
    name: "BADE",
    creditCustomes,
    Acconuts,
    result,
  });
};

//get single payment
module.exports.singlePayment_get = async (req,res,next)=>{
  if(ObjectId.isValid(req.params.id)){
    const payment =  await CreditCustomerPayment.findById(req.params.id)
    const customer = await Customer.findById(payment.BillNo)
    res.status(200).render('SinlePayment',{name:'BADE',payment,customer})
  }
}

// for AccountSettingLanding
module.exports.AccountSettingLanding_get = async (req, res) => {
  const account = await Account.find();
  const WHous = await WHouse.find();
  res.render("AccountSettingLanding", { name: "BADE", account, WHous });
};

// get single bank account
module.exports.SingleAccount_get = async (req,res)=>{
  try {
    const WHous = await WHouse.find();
    await Account.findById(new ObjectId(req.params.Account)).then(
      async (account) => {
        const SelectedWhouse = await WHouse.findById(account.locationOfUse)
       const entries = await CreditCustomerPayment.find({bankAccount: account.bankCode}).sort({ createdAt: -1 })
        res.status(200).render("SingleAccount", { name: "BADE", account,entries ,WHous,SelectedWhouse});
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// to create bank ,account
module.exports.BankAccount_post = async (req, res) => {
  try {
    await Account.create(req.body).then(async (account) => {
      if (account) {
        await CreditCustomerPayment.create({
          PaymentDate: moment().format("l"),
          Accountant: "ADMINISTRATOR/CFO",
          bankAccount: account.bankCode,
          paymentReferenceNo: `OPENNING BALANCE ${account.bankName.toUpperCase()}}`,
          crAmount: account.Balance,
          drAmount: 0,
          cr: true,
          BillNo: account._id,
          collectionRef: "OPENNING BALANCE",
          previousBalance: account.Balance,
        });
        res
          .status(200)
          .json({ message: `${account.NAME} added to list of account` });
      } else {
        throw new Error("something went wrong");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// interbalance transfer
module.exports.BankAccount_patch = async (req, res) => {
  try {
    await Account.findOne({ bankCode: req.params.Account }).then(
      async (acc) => {
        if (!acc) {
          throw new Error("Ensure to transfer Balance to an exsisting account");
        } else {
          const RECIEVING = await Account.findOne({
            bankCode: req.body.RECIEVING,
          });
          NewBalance = RECIEVING.Balance;
          NewBalance2 = acc.Balance;
          if (acc.bankCode === RECIEVING.bankCode) {
            throw new Error("You cant send balance to the same account");
          } else if (acc.Balance < req.body.Amount) {
            throw new Error(
              "Insufficent Fund, try transfering from another account"
            );
          } else {
            await Account.updateOne(
              { _id: RECIEVING._id },
              {
                $set: {
                  Balance: RECIEVING.Balance + parseInt(req.body.Amount),
                },
              }
            ).then(async (acknowledged) => {
              if (acknowledged) {
                await Account.updateOne(
                  { _id: acc._id },
                  { $set: { Balance: acc.Balance - parseInt(req.body.Amount) } }
                );
                // create payment log
                await CreditCustomerPayment.create(
                  {
                    PaymentDate: req.body.date,
                    Accountant: req.body.Initiator,
                    bankAccount: req.body.RECIEVING,
                    paymentReferenceNo: req.body.paymentReferenceNo,
                    crAmount: req.body.Amount,
                    drAmount: 0,
                    cr: true,
                    BillNo: req.body.BillNo,
                    collectionRef: "TRNS",
                    previousBalance: NewBalance,
                  },
                  {
                    PaymentDate: req.body.date,
                    Accountant: req.body.Initiator,
                    bankAccount: req.body.TRANSFER,
                    paymentReferenceNo: `${req.body.paymentReferenceNo}DR`,
                    drAmount: req.body.Amount,
                    crAmount: 0,
                    dr: true,
                    BillNo: req.body.BillNo,
                    collectionRef: "TRNS",
                    previousBalance: NewBalance2,
                  }
                );
                res.status(201).json({
                  message: `₦${req.body.Amount} Successfully transferred`,
                });
              } else {
                throw new Error("Error moving funds to account");
              }
            });
          }
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//register customer payment
module.exports.registerCustomerPayment_post = async (req, res,next) => {
  try{
     //find the customer
     let salesPerson
      await Customer.findById(req.body.customer).then(async customer =>{
        salesPerson = await Employe.findById(customer.salesPerson)
     })
    
     // calculate new debt after payment
     let currentDebt = customer.Debt;
     // lastPayDate:req.body.PaymentDate
     NewDebt = currentDebt - parseInt(req.body.Amount);
     const account = await Account.findOne({ bankCode: req.body.bankAccount });
     NewBalance = parseInt(account.Balance) + parseInt(req.body.Amount);
     await CreditCustomerPayment.create({
       PaymentDate: req.body.PaymentDate,
       Accountant: req.body.Accountant,
       bankAccount: req.body.bankAccount,
       paymentReferenceNo: req.body.paymentReferenceNo,
       crAmount: req.body.Amount,
       drAmount: 0,
       cr: true,
       BillNo: req.body.customer,
       customer: req.body.customer,
       collectionRef: "PMNT",
       previousBalance: NewBalance,
       remarks: `${salesPerson.firstName} ${salesPerson.lastName}`
     })
     .then(payment =>{
      if(payment){
       res.status(200).json({message:'Payment successful Registered and pending Confirmation.'})
      }else{
        throw new Error("Failed to create payment");
      }

     })
  }catch(err){
    res.status(500).json({ error: err.message });
  }
};

// for transfers logs to ware house
module.exports.productTransferLogs_get = async (req, res) => {
  const transferLogs = await ProductTransfer.find();
  const WHous = await WHouse.find();
  res
    .status(200)
    .render("ProductTransferLanding", { name: "BADE", transferLogs, WHous });
};

// SingleProductTransfer_get
module.exports.SingleProductTransfer_get = async (req, res) => {
  if (ObjectId.isValid(req.params.TRANSFERREF)) {
    try {
      const transferLog = await ProductTransfer.findById(
        ObjectId(req.params.TRANSFERREF)
      );
      const Whouse = await WHouse.findById(new ObjectId(transferLog.from));
      const to = await WHouse.findById(new ObjectId(transferLog.to));
      const Business = await companyRegister.findOne();
      res.status(200).render("SingleProductTransfer", {
        name: "BADE",
        transferLog,
        Whouse,
        to,
        Business
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.end();
  }
};

// GET transfer log by ware house
module.exports.WHProductTransfer_get = async (req, res) => {
  const InBound = await ProductTransfer.find({ from: req.params.WHID });
  const outBound = await ProductTransfer.find({ to: req.params.WHID });
  const result = await WHouse.findById(req.params.WHID);
  const WH = await WHouse.find();
  res.status(200).render("WareHouseStockTransfer", {
    name: "BADE",
    InBound,
    outBound,
    result,
    WH,
  });
};

//product trasferform to ware house
module.exports.ProductTransferForm_get = async (req, res, next) => {

  try {
    const WHous = await WHouse.find();
    const PurchaseOrders = await PurchaseOrder.find();
    res
      .status(200)
      .render("ProductTransferForm", { name: "BADE", WHous, PurchaseOrders });
  } catch (error) {
    console.log(error);
  } finally {
    res.end();
  }
};

// get warehouse json data for product transfer form
module.exports.wareHouseJson_get = async (req, res) => {
  try {
    const WHous = await WHouse.findOne({ _id: req.params.WHID });
    const storeproduct = await storeProduct.find({ WHIDS: req.params.WHID });
    const products = await Product.find();
    res.json({ WHID: WHous._id, products, storeproduct });
  } catch (err) {
    res.end();
  }
};

// post for product transfer
module.exports.ProductTransferForm_post = async (req, res, next) => {
  try {
    await ProductTransfer.create(req.body).then(async (transfer) => {
      if (transfer) {
        // remove product from ware house and hold on transfer log
        transfer.orders.forEach(async (product) => {
          const holder = await storeProduct.findById(product.item._id);
          checker = holder.currentQty - product.Qty;
          await storeProduct.updateOne(
            { _id: ObjectId(product.item._id) },
            { $set: { currentQty: checker } }
          );
        });
        const from = await WHouse.findById(transfer.from);

        from.Notification.unshift({
          message: `Stock move initiated from your ware house by invoicer on ${responseDate}`,
        });
        from.save();
        next(); //notify cfo for confirmation
      } else {
        throw new Error(" Something went wrong");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.ProductTransferForm_patch = async (req, res) => {
  transfer = await ProductTransfer.findById(req.params.id);
  try {
    if (transfer.storeKeeperApproval || transfer.status === "Store Rejected") {
      throw new Error("This Product Transfer is  Already complete");
    } else {
      if (req.body.cfoApproval) {
        await ProductTransfer.updateOne(
          { _id: ObjectId(transfer._id) },
          {
            $set: { cfoApproval: req.body.cfoApproval, status: "CFO approved" },
          }
        );
      } else if (req.body.cfoApproval === false) {
        //send product back to from (warehouse) inventory
        transfer.orders.forEach(async (product) => {
          const holder = await storeProduct.findById(product.item._id);
          checker = holder.currentQty + product.Qty;
          await storeProduct.updateOne(
            { _id: ObjectId(product.item._id) },
            { $set: { currentQty: checker } }
          );
        });
        await ProductTransfer.updateOne(
          { _id: ObjectId(transfer._id) },
          { $set: { status: "CFO canceled" } }
        );
      } else if (req.body.status === "Store Rejected") {
        await ProductTransfer.updateOne(
          { _id: ObjectId(transfer._id) },
          { $set: { status: "Store Rejected" } }
        );
      } else if (req.body.storeKeeperApproval) {
        const to = await WHouse.findById(transfer.to);
        const from = await WHouse.findById(transfer.from);
        // remove product from ware house and hold on transfer log
        transfer.orders.forEach(async (product) => {
          const holder = await storeProduct.findById(product.ToId);
          checker = holder.currentQty + product.Qty;
          await storeProduct.updateMany(
            { _id: ObjectId(product.ToId) },
            {
              $set: {
                currentQty: holder.currentQty + product.Qty,
                BatchNo: product.item.BatchNo,
                ExpDate: product.item.ExpDate,
                LastBatchDate: product.item.LastBatchDate,
              },
            }
          );
          holder.ActivitiyLog.unshift({
            message: `${product.Qty} carton was sucessfully transfered from ${from.WHName} on ${responseDate} with ${transfer.billReferenceNo}`,
          });
          holder.save();
        });
        to.Notification.unshift({
          message: `Stock Transfer Approved for your ware house from ${transfer.billReferenceNo} on ${responseDate}`,
        });
        await ProductTransfer.updateOne(
          { _id: ObjectId(transfer._id) },
          {
            $set: {
              status: req.body.status,
              storeKeeperApproval: req.body.storeKeeperApproval,
              recievedDate: req.body.recievedDate,
            },
          }
        );
        to.save();
      }
      res.status(200).json({ message: "Update successfull." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// category creation
module.exports.ExpenseCategory = async (req, res) => {
  try {
    await ExpenseCat.create(req.body).then((category) => {
      if (category) {
        res.status(200).json({ message: "Category created successfully" });
      } else {
        throw new Error("Category creation failed");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create umo
module.exports.umo = async (req, res) => {
  try {
    await UMO.create(req.body).then((umo) => {
      if (umo) {
        res.status(200).json({ message: "unit created successfully" });
      } else {
        throw new Error("unit creation failed");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create productCategory
module.exports.productCategory = async (req, res) => {
  try {
    await ProductCat.create(req.body).then((ProductCat) => {
      if (ProductCat) {
        res.status(200).json({ message: "product Category successfully" });
      } else {
        throw new Error(" creation failed");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete rout for product category
module.exports.deleteProductCategory = async (req, res) => {
  await ProductCat.deleteOne({ _id: req.params.CATID }).then((acknowledged) => {
    if (acknowledged) {
      res.redirect("/api/v1/VirtualstorageProduct");
    }
  });
};

// product BuyingPrice_change
module.exports.BuyingPrice_change = async (req, res, next) => {
  try {
    await Product.findById(req.params.id).then(async (products) => {
      if (products) {
        await storeProduct
          .find({ productId: ObjectId(products._id) })
          .then(async (inventoryItem) => {
            const Carton = inventoryItem
              .map((item) => {
                return item.currentQty;
              })
              .reduce((total, currentValue) => {
                diff = parseInt(
                  req.body.updatedBuyingPrice - products.vendor_Price
                );
                return total + currentValue * diff;
              }, 0);


            const rolls = inventoryItem
              .map((item) => {
                return item.Rolls;
              })
              .reduce((total, currentValue) => {
                diff =
                  parseInt(
                    req.body.updatedBuyingPrice - products.vendor_Price
                  ) / products.Rolls;
                return total + currentValue * diff;
              }, 0);

            // create pnl product revaluation price
            await HistoricalpriceChange.create({
              productId: products._id,
              date: moment().format("l"),
              Newprice: req.body.updatedBuyingPrice,
              diffrence: req.body.updatedBuyingPrice - products.vendor_Price,
              oldPrice: products.vendor_Price,
              overallPriceChange: Carton + rolls,
            });

            products.vendor_Price = req.body.updatedBuyingPrice;
            products.save();
          });

        next(); //send mail to notify cfo of price change
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all product in excel format
module.exports.ExcelProduct_get = async (req, res) => {
  // const workBook = XLSX.readFile("Product.xlsx");

  const workSheetColumnsNames = [
    "_id",
    "SKU_Name",
    "PRODUCT_CODE",
    "CATEGORY",
    "VAT",
   " TOTAL_QTY_SOLD",
    "VAN_PRICE",
    "SUPER_MARKET_PRICE",
    "WAREHOUSE_PRICE",
    "ROLL_IN_CARTON",
   " PIECIES_IN_ROLL",
    "SOLD_IN_WARE_HOUSE",
    "SOLD_ON_ECOMMERCE",
    "VAN_PROMO",
    "WAREHOUSE_PROMO",
    "SUPER_MARKET_PROMO",
    "VENDOR",
    "BP"
  ];
  const Products = await Product.find();
  let vendor = await Vendor.find();

  data = Products.map((data) => {
    ven = vendor
      .filter((ven) => {
        return ven._id.toString() === data.Vendor.toString();
      })
      .map((name) => {
        return name.Name;
      });
    return [
      `${data._id}`,
      data.Name,
      data.ACDcode,
      data.category,
      data.VAT,
      data.TotalSale,
      data.Van_Price,
      data.Market_Price,
      data.WareHouse_Price,
      data.Rolls,
      data.Pieces,
      data.Sellable,
      data.Ecom_sale,
      data.VanPromo,
      data.WholesalePromo,
      data.MarketPromo,
      ven[0],
      data.vendor_Price,
    ];
  });

  const workBook = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnsNames, ...data];

  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workBook, workSheet, `Product`);
  XLSX.writeFile(workBook, path.resolve(`./Product.xlsx`));

  res.download(`Product.xlsx`);
};

module.exports.deliveryExcel_get = async (req, res) => {
  const workSheetColumnsNames = [
    "_id",
    "customerId",
    "customer",
    "INVOICE REF NO",
    "WAY BILL NO",
    "DELIVERY FEE (₦)",
    "DELIVERY DATE",
    "DISPACHER TEL",
    "DISPACHER PLATE NUMBER",
    "COMMENT",
  ];

  const Store = await WHouse.findById(req.params.WHID);
  const Product = await bills.find({ whId: req.params.WHID });
  data = Product.map((data) => {
    return [
      `${data._id}`,
      data.customer.toString(),
      data.customerName,
      data.billReferenceNo.toString(),
      data.WayBillNo,
      `₦${parseInt(data.shippingFee)}`,
      moment(data.DELIVERYDATE).format("dddd, MMMM Do YYYY,"),
      data.DriverName,
      data.DriverNumber,
      data.DeliveryComment,
    ];
  });

  const workBook = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnsNames, ...data];

  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workBook, workSheet, `${Store.WHName} Delivery`);
  XLSX.writeFile(workBook, path.resolve(`./Delivery.xlsx`));

  res.download(`Delivery.xlsx`);
};


//get request for transfers by whouse
module.exports.WareHouseLPO_get = async (req, res) => {
  if (ObjectId.isValid(new ObjectId(req.params.WHID))) {
    const result = await WHouse.findById(req.params.WHID);
    await PurchaseOrder.find({ WHID: req.params.WHID }).then((transfers) => {
      transfers = transfers.filter((transfers) => {
        return transfers.paymentStatus === "Paid";
      });
      res
        .status(200)
        .render("WarehouseLPO", { name: "BADE", result, transfers });
    });
  } else {
    res.redirect("/api/v1/404");
  }
};

//get for ware house request for returns form


//get request for bills by ware house in json format
module.exports.Return_json = async (req, res) => {
  try {
    await bills
      .findOne({ billReferenceNo: req.params.billReferenceNo })
      .then((data) => {
        if (!data) {
          throw new Error("NOT FOUND");
        } else if (data.billStatus === "Cancelled") {
          throw new Error("Exsisting Credit not already exist");
        } else if (data.whId.toString() !== req.params.WHID.toString()) {
          throw new Error(
            `This ${data.billStatus} was not raised in your current location`
          );
        } else {
          res.status(200).json({data: data});
        }
      });
  } catch (errors) {
    console.log(errors.message);
    res.status(500).json({ error: errors.message });
  }
};

//create new return
module.exports.Returns_post = async (req, res, next) => {
  try {
    await Returns.create(req.body).then((RMA) => {
      if (RMA) {
        next();
      } else {
        throw new Error("Something went wrong");
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//change to some other excel not needed
module.exports.SingleDeliveryExcel_get = async (req, res) => {
  let data = await bills.findById(req.params.DeliveryId);

  const workBook = XLSX.readFile(`SingleDelivery.xlsx`);

  //conver the xlsx to json format
  let workSheet = {};
  for (const sheetName of workBook.SheetNames) {
    workSheet[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
  }

  workSheet.Sheet1 = []; //clear sheet then populate sheet with new values

  //data from  req.body to register payments for accounting purposes
  workSheet.Sheet1.push({
    _id: `${data._id}`,
    customerId: data.customer.toString(),
    customer: data.customerName,
    "INVOICE REF NO": data.billReferenceNo.toString(),
    "DELIVERY FEE (₦)": `₦${parseInt(data.shippingFee)}`,
    "DELIVERY DATE": moment(data.DELIVERYDATE.toLocaleString()).format(
      "dddd, MMMM Do YYYY,"
    ),
    DISPACHER: data.DriverName,
    "DISPACHER TEL": data.DriverNumber,
    "DISPACHER PLATE NUMBER": data.vehicleNumber,
    COMMENT: data.DeliveryComment,
  });

  XLSX.utils.sheet_add_json(workBook.Sheets["Sheet1"], workSheet.Sheet1);
  await XLSX.writeFile(workBook, `SingleDelivery.xlsx`);
  res.status(200).download(`SingleDelivery.xlsx`);

  // console.log("json:\n",JSON.stringify(workSheet.Sheet1),"\n\n")
};

module.exports.wareHouseBillExcel_get = async (req, res, next) => {
  const workBook = XLSX.readFile("Warehouse.xlsx");

  let data = await bills.find({ whId: req.params.WHID });

  //conver the xlsx to json format
  let workSheet = {};
  for (const sheetName of workBook.SheetNames) {
    workSheet[sheetName] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
  }

  workSheet.Sheet1 = []; //clear sheet then populate sheet with new values
  data.forEach((data) => {
    //data from  req.body to register payments for accounting purposes
    workSheet.Sheet1.push({
      _id: `${data._id}`,
      customerId: data.customer.toString(),
      customer: data.customerName,
      "Grand Total (₦)": `₦${parseInt(data.grandTotal)}`,
      "ShippingFee (₦)": `₦${data.shippingFee}`,
      "Start Date": data.startDate,
      "Payment Method": data.paymentMethod,
      Orders: data.orders.length,
      Promotion: data.promotionItems.length,
      Status: data.billStatus,
      "Bank Account": data.bankAccount,
      "Discount %": data.discount,
      "raised By": data.RaiseBy,
      "Registered Balance": `₦${data.registeredBalance}`,
      "Reference No": data.billReferenceNo,
      "Bill Status": data.status,
      AccountantName: data.AccountantName,
    });
  });

  XLSX.utils.sheet_add_json(workBook.Sheets["Sheet1"], workSheet.Sheet1);
  await XLSX.writeFile(workBook, "Warehouse.xlsx");
  res.status(200).download("Warehouse.xlsx");

  // console.log("json:\n",JSON.stringify(workSheet.Sheet1),"\n\n")
};

// get excel for ware house inventory
module.exports.InventoryReport_get = async (req, res) => {
  const workSheetColumnsNames = [
    "_id",
    "Products",
    "PRODUCT CODE",
    "Carton Available",
    "Rolls Available",
    "Activated",
    "Vendor",
    "Category",
    "Expiry Date",
    "Batch Number",
    "Last Batch Date",
  ];

  const Store = await WHouse.findById(req.params.WHID);
  const Product = await storeProduct.find({ WHIDS: req.params.WHID });
  data = Product.map((product) => {
    return [
      product._id.toString(),
      product.productName,
      product.ADCcode,
      product.currentQty,
      product.Rolls,
      product.isActivated,
      product.vendorName,
      product.category,
      product.ExpDate,
      product.BatchNo,
      product.LastBatchDate,
    ];
  });

  const workBook = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnsNames, ...data];

  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workBook, workSheet, `${Store.WHName} Repeort`);
  XLSX.writeFile(workBook, path.resolve(`./ClosingStock${responseDate}.xlsx`));

  res.download(`ClosingStock${responseDate}.xlsx`);
};

module.exports.StoreProduct_get = async (req, res) => {
  await storeProduct.find({ WHIDS: req.params.WHID }).then((product) => {
    res.status(200).json(product);
  });
};

module.exports.StoreProductUpdate = async (req, res) => {
  await storeProduct.findById(ObjectId(req.params.PRODUCTID))
  .then((product) => {
    res.status(200).render('SingleStoreProduct',{product})
  });
};
