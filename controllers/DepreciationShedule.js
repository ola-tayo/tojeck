const { ObjectId } = require("mongodb");
var moment = require("moment");
const Employe = require("../modules/Employees");
const Emails = require("../modules/Email");
const Vendor = require("../modules/Vendors");
const BeamCard = require("../modules/BeamCard");
const Assets = require("../modules/Assets");
const Events = require("../modules/Events");
const Location = require("../modules/Location");
const Customers = require("../modules/customers");
const KPI = require("../modules/kpi");
const {jobTittle,Department} = require("../modules/departments");
const mongoose = require("mongoose");
const { WHouse } = require("../modules/warehouse");
const birthdayTemplates = require("../EmailTemplates/birthdatTemplate");
const { PASSWORD, EMAIL, ERPSmtpName } = require("../.env");
const nodemailer = require("nodemailer");
const companyRegister = require("../modules/company");
const Helpdesk = require("../modules/Tickets");
const LiveChatLink = require("../Functions/ContactFormResponse")
const {storeProduct} = require("../modules/warehouse");
const Product = require("../modules/Product");
const AutomatedInvoice = require("../modules/AutomatedInvoice");
const customers = require("../modules/customers");
const {Van, retailInvoice} = require('../modules/Van')
const RetailCustomer = require("../modules/retailer");
const NaijaStates = require("naija-state-local-government");
const RetailTransaction = require("../modules/RetailtransactionLog")

//get all asset
module.exports.asset_get = async (req, res, next) => {
  const assets = await Assets.find();
  const Employees = await Employe.find({$and: [
    { status: "active" }]})
  res.status(200).render("./AssetViews/asset", { assets ,name: "BADE",Employees});
};


module.exports.asset_post_create = async (req, res, next) => {
  try {
    await Assets.create(req.body).then((asset) => {
      if (asset) {
        res.status(200).json({ message: "Asset created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get single asset
module.exports.SingleAsset = async (req, res) => {
  if (ObjectId.isValid(req.params.AssetId)) {
    try {
      await Assets.findById(req.params.AssetId)
        .limit(1)
        .then(async (asset) => {
          const Employees = await Employe.find({$and: [
            { status: "active" }]})
          if (asset) {
            res
              .status(200)
              .render("./AssetViews/SingleAsset", { asset, Employees,name: "BADE" });
          } else {
            throw new Error("Could find this asset");
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};


// patch for edit on asset 
module.exports.Asset_Patch = async (req, res) => {
  if (ObjectId.isValid(req.params.AssetId)) {
    try {
      await Assets.updateOne(
        { _id: ObjectId(req.params.AssetId) },
        { $set: req.body }
      ).then((acknowledged)=>{
        acknowledged ? res.status(200).json({message:'Asset updated Successfully'}) : res.status(500).json({error:'Error updating'})
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

module.exports.BirthdayMessage = async (req, res) => {
  // for birthdat notifications
  const birth = moment().format();

  // send  birthday mail automatically
  const data = await Employe.find({$and: [
    { status: "active" }]})
  const birthdayPerson = data.filter((person) => {
    return person.DOB.toString().substring(5, 10) === birth.substring(5, 10);
  });

  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    tls: { rejectUnauthorized: false }, //always add this to stop error in console
  };

  let transporter = nodemailer.createTransport(config);

  //send mail to each email
  birthdayPerson.forEach((person) => {
    if (person) {
      let message = {
        from: EMAIL,
        to: person.Email, //employee email
        subject: `Bade Team wishes ${person.firstName} a Happy Birthday `,
        html: birthdayTemplates(person),
      };

      transporter
        .sendMail(message)
        .then(() => {
          res
            .status(200)
            .json({
              message: `birthday message sent to ${birthdayPerson.length} person`,
            });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    }
  });
};

// vendor transaction report
module.exports.vendorTransactionReport = async (req, res, next) => {
  const vendors = await Vendor.find();
  res.status(200).render("vendorTransaction", { vendors ,name: "BADE"});
};

// ..for vat report
module.exports.VAT_REPORT = async (req, res, next) => {
  const wareHouse = await WHouse.find();
  res.status(200).render("VatReport", { wareHouse,name: "BADE" });
};

// for task management
module.exports.taskManager = async (req, res, next) => {};


// create warehouse location get route
module.exports.SubLocation_get = async(req,res,next) =>{

  const loaction = await Location.find()
  res.status(200).render("LocationPage",{loaction})

}

// calender get
module.exports.Calendar_get = async (req,res,next) =>{
  
  res.status(200).render("Calendar", { name: "BADE" });
}

// create events
module.exports.EventCreate = async (req,res,next) =>{
 try {
  await Events.create(req.body).then((event)=>{
    if(event){
      res.status(200).json({message:'Event Registered successfully'})
    }else{
      throw new Error('Something went Wrong')
    }
  })
 } catch (error) {
    res.stautus(500).json({error:error.message})
 }
}


// post request for location 
module.exports.LocationCreate = async (req,res,next)=>{
  try{
    await Location.create(req.body).then((loc)=>{
      if(loc){
        res.status(200).json({message:'New Location Added Sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
  }catch(err){
    res.status(500).json({error:err.message})
  }
}

// POST REQ FOR KPI 
module.exports.KPICreate = async (req,res,next)=>{
  try{
    await KPI.create(req.body).then((Kpi)=>{
      if(Kpi){
        res.status(200).json({message:'New KPI Added Sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
  }catch(err){
    res.status(500).json({error:err.message})
  }
}


// for creating job tittle
module.exports.jobtittle_post = async (req, res, next) => {
  try {
    await jobTittle.create(req.body).then((asset) => {
      if (jobTittle) {
        res.status(200).json({ message: "New job tittle added successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create departments
module.exports.Department_post = async (req, res, next) => {
  try {
    await Department.create(req.body).then((asset) => {
      if (Department) {
        res.status(200).json({ message: "New Department added successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateStockCount = async (req, res, next) => {
 try {
    await BeamCard.create(req.body).then(entry =>{
      if(entry){
        res.status(200).json({message:'Stock card Entry submited sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
 } catch (error) {
    res.status(500).json({error:error.message})
 }
};

module.exports.Singlecard_get = async (req,res)=>{
    try {
      if (ObjectId.isValid(req.params.id)) {
        await BeamCard.findById(req.params.id).then(async card =>{
          const Whouse = await WHouse.findById(card.WHID);
          res.status(200).render('singleStockCard',{card,name:'BADE',Whouse})
        })
      }else{
        res.redirect('/api/v1/404')
      }
    } catch (error) {
      res.redirect('/api/v1/404')
    }
}

module.exports.UserNotification_get = async (req, res, next) => {
  // const data = await Employe.find({$and: [
  //   { status: "active" }]})
  res.status(200).render('userNotification', { name:'BADE'})
}

module.exports.contact_form_get = async (req,res,next) =>{
  const Business = await companyRegister.findOne();
  res.status(200).render('ContactForm', {Business, name:'BADE'})
}

//submit contact form
module.exports.contact_form_post = async (req,res,next) => {
 try {
  await Helpdesk.create(req.body).then(ticket => {
    if(ticket){
      LiveChatLink(ticket)
      res.status(200).json({message:'Support ticket registered successfully, You can also use the link sent to your Email to follow up with a Support person'})
    }else{
      throw new Error('Something went Wrong')
    }
   })
 } catch (error) {
  res.status(200).json({error:error.message})
 }
}

//get Livechat_get
module.exports.Livechat_get = async (req,res,next)=>{
  try {
    if (ObjectId.isValid(req.params.chatId)) {
      const Business = await companyRegister.findOne();
      await Helpdesk.findById(req.params.chatId).then(SingleLead => {
        res.status(200).render('livechat', { SingleLead,Business, name: 'BADE' });
      });
    }else{
      res.redirect('/api/v1/404');
    }
  } catch (error) {
    
  }
}


module.exports.chat = async (req, res) => {
  const {messageBody,senderId,author} = req.body
 
  try {
    const updatedStory = await Helpdesk.findByIdAndUpdate(
      req.params.chatId,
      {
          $push: {
            conversation: {
              messageBody,
              senderId,
              author,
            },
          },
      },
      { new: true } // Return the updated document
  );

  res.status(200).json(updatedStory)

  } catch (error) {
    console.log(error.message)
    res.status(500).json({error:'Something went wrong. Message did not deliver '})
  }
};

// display for customer chat
module.exports.CustomerLivechatLink = async (req,res)=>{
 try {
  const SingleLead = await Helpdesk.findById(req.params.chatId)
  res.status(200).render('customerChat',{SingleLead})
 } catch (error) {
  console.log(error.message)
 }
}

module.exports.chatUpdate_get = async (req, res)=>{
  try {
    const SingleLead = await Helpdesk.findById(req.params.chatId)
    res.status(200).json({response:SingleLead})
  } catch (error) {
    
  }
}

// get all help desk ticket
module.exports.TicketView_get = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.Helpdesk = await Helpdesk.find().sort({status:-1})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Helpdesk.find().countDocuments().exec())) {
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

  const searchAllHelpdesk = await Helpdesk.find().sort({status:-1});
  res.status(200).render("TicketView", { name: "BADE" ,result,searchAllHelpdesk});
};


//FOR INTERNAL USERS ONLY
module.exports.SingleTicket = async (req, res) => {
 const admin = await Department.find()
  await Helpdesk.findById(req.query.id)
  .then((SingleLead)=>{
    if(SingleLead){
      res.status(200).render('SingleTicketInt',{SingleLead,admin, name:'BADE'})
    }
  })
}

//actioning tickets 
module.exports.TicketId_patch = async(req,res,next)=>{
  await Helpdesk.updateOne({_id:req.query.TicketId},{ $set: req.body }).then(async(acknowledged)=>{
    if(acknowledged){
      // send mail notification to the department Hod 
      const Tks = await Helpdesk.findById(req.query.TicketId)
      if(Tks.internalUnitId === ''){
        res.status(200).json({message:'Your action has been Updated successfully'})
      }else{
        //either send mail or handle notification on app
        //note no next fuction added yet
        next()
      }
    }
  })
}

//get departments for support requests
module.exports.getDepartments = async (req, res) => {
  const Departments = await Department.find()
  const Hod = await Employe.find({$and: [
      { status: "active" }]})
  res.status(200).render('DepartmentList',{Departments,Hod})
}

module.exports.SupportDepartment = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.Departments = await Department.findById(req.query.department)
  result.Helpdesk = await Helpdesk.find({internalUnitId:req.query.department}).sort({status:-1})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Helpdesk.find().countDocuments().exec())) {
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

  res.status(200).render('SupportDepartment',{result})
}


module.exports.Marketing_get = async  (req, res) => {
  const Email = await Emails.find()
  const customerList = await Customers.find({NewsFeedSubscription:true,blocked:false}).sort({Email:1})
  res.render("Marketing", { Email,customerList, name: "BADE" });
};

module.exports.Marketing_post = async (req, res,next) => {
 try {
  await Emails.create(req.body).then(mail =>{
    if(mail){
      // sent mails in next function
     res.status(200).json({message:'Email Entry created successfully.'});
    }else{
      throw new Error('Couldn\'t create email entry ')
    }
 })
 } catch (error) {
  res.status(500).json({error:error.message});
 }
};

//return product from Qrcode scanner
module.exports.QrScanner = async (req,res,next) => {
  try {
    if(ObjectId.isValid(req.params.storeProductId)){
      await AutomatedInvoice.findOne({
        whId: req.params.WHID
       }).then(async (OpenInv) =>{
          if(OpenInv){
            // check if status is open
            if(OpenInv.status === 'open'){
              await storeProduct.findById(req.params.storeProductId)
              .then(async (product)=>{
                //filter and rturn price thatt is equal to customer price list
                const customerPriceList = await customers.findById(OpenInv.customer)
                .then((customer)=>{
                  return customer.priceList
                });
                
                //check pricelias
                const productPrice  = (customerPriceList)=>{
                  if(customerPriceList === 'Market_Price'){
                    return product.Market_Price
                  }else if (customerPriceList === 'Van_Price'){
                    return product.Van_Price
                  }else{
                    return product.WareHouse_Price
                  }

                }
      
                const item = await Product.findById(product.productId)
                 //check promo
                 const promo = (customerPriceList)=>{
                   if(customerPriceList === 'Market_Price'){
                    return item.MarketPromo
                   }else if (customerPriceList === 'Van_Price'){
                    return item.VanPromo
                   }else{
                    return item.WholesalePromo
                   }

                 }
      
                // add to invoice order
                await AutomatedInvoice.findByIdAndUpdate(
                  OpenInv._id,
                  {
                      $push: {
                        orders:  {
                          id:new ObjectId(),
                          promotionData:promo(customerPriceList),
                          BatchId:product.BatchNo,
                          CRT:product.currentQty,
                          ExpiryDate:product.ExpDate,
                          ROL:product.Rolls,
                          item,
                          returnId:'',
                          storeProductId:product._id,
                          ROLQTY:0,
                          Qty:0,
                          priceListPrice:productPrice(customerPriceList),
                          total:0
                        },
                      },
                  },
                  { new: true } // Return the updated document
                );
              
              })
              res.status(200).render('QRAdded',{name:'BADE',message:'Product Added successfully'})
            }else{
              throw new Error('This invoice is locked')
            }
          }else{
            throw new Error('No open record found')
          }
       });
    }else{
      res.redirect('/api/v1/404')
    }
  } catch (error) {
    res.status(302).render('QRAdded',{name:'BADE',message:error.message});
  }
}


//create open record for storekeeper to add via qrcode
module.exports.AutomatedInvoice_post = async (req,res,next) => {
  try {
    await AutomatedInvoice.create(req.body).then((newInv)=>{
      if(newInv){
        res.status(200).json({message:'Smart Invoice created successfully.'});
      }else{
        throw new Error('Couldn\'t create smart invoice ')
      }
    })
  } catch (error) {
    res.status(500).json({error:error.message});
  }
}

module.exports.AUTOMATED_INVOICING = async (req, res) => {
  const wareHouse = await WHouse.findById(req.params.WHID);
 const openQuotation = await AutomatedInvoice.find({whId:wareHouse._id})
 const Business = await companyRegister.findOne();
 const Cusomers = await customers.find({blocked:false});
 const currencies = await fetch('https://gist.githubusercontent.com/manishtiwari25/d3984385b1cb200b98bcde6902671599/raw/c004cf168b4532798361e0aee65f3a5b192136cf/world_currency_symbols.json')
  .then((response)=>{
   return response.json()
  })
  res.status(200).render('Automated',{name:"BADE",openQuotation,wareHouse,Business,Cusomers,currencies})
}

module.exports.SingleAUTOMATED_INVOICING = async (req,res,next)=>{
  const Business = await companyRegister.findOne();
   await AutomatedInvoice.findOne({ _id: new ObjectId(req.query.id) })
   .then(async (Singlebill)=>{
    if (!Singlebill) {
      res.redirect("/api/v1/404");
    } else {
      await WHouse.findOne({ _id: new ObjectId(Singlebill.whId) }).then(
        async (warehouse) => {
          cust = await customers.findOne({
            _id: new ObjectId(Singlebill.customer),
          });
        })
        res.status(200).render('SingleAutomated',{Singlebill,Business,cust,name:"BADE"})
    }
   })
}

module.exports.SmartInvoice = async (req,res,next)=>{
  await AutomatedInvoice.findOne({ _id: new ObjectId(req.query.id) }).limit(1)
  .then((data) =>{
    if (!data) {
     return next();
    } else {
      res.status(200).json({Invoice:data})
    }
  })

}


// for landing page on point of sale
module.exports.getPosDashboard = async (req, res, next) =>{
  try{
    const employees = await Employe.find({$and: [
      { status: "active" },{isManager: false}]})

      const manager = await Employe.find({$and: [
        { status: "active" },{isManager: true}]})

      const Locations = await WHouse.find({$and: [
        { Status: true }]}) 
        const Vans = await Van.find()
      res.status(200).render('./retail/Vans',{employees,Locations,Vans,manager})
  }catch(err){
    if(err){
      res.redirect('/api/v1/404')
    }
  }
}

// creating a new van
module.exports.vanCreation = async (req, res,  next) => {
  try {
    await Van.create(req.body).then(async(newVan) => {
      if (newVan) {
       await Product.find({$and: [
        { Ecom_sale: true }]})
        .then(async (products) => {
          const update = products.map((product) => {
              return {
                productId:product._id,
                Qty: 0,
                priceListPrice:Math.ceil(product.Van_Price / product.Pieces),
                BuyingPrice: Math.ceil(product.updatedBuyingPrice / product.Pieces),//this vendor price
                Vendor: product.Vendor,
                image: product.image,
                description: product.Description,
                promotion:Math.ceil(product.VanPromo / product.Pieces),
                productName:product.Name,
                vat:product.VAT,
                BatchNo: product.BatchNo,
                ExpDate: product.ExpDate,
                productCode : product.ACDcode,
              };
            })
            //push new product to cart of van product
            await Van.findByIdAndUpdate(newVan._id, { $push: { Cart: { $each: update } } }, { new: true });
        });
        res.status(200).json({ message: 'Van created successfully.Please reload the page to see update' });
      } else {
        throw new Error('Couldn\'t create new Van');
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get single van 
module.exports.SingleVan = async (req,res,next) => {
  // const van = await Van.findById(req.query.van).populate('Cart.productId');
  try {
    const van = await Van.findById(ObjectId(req.query.van));
    if (!van) {
      res.status(404).redirect('/api/v1/404')
    } else {
      const invoice = await retailInvoice.find({
        vanId: van._id,
      })
      const d = new Date();
      const TodaySale = invoice.filter((b) => {
        return (
          b.InvoiceDate === `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` && b.InvoiceStatus === "invoice"
        );
      })
        .map((bill) => {
          return parseInt(bill.TotalPrice);
        })
        .reduce((total, currentValue) => {
          return parseInt(total + currentValue);
        }, 0);

        // get todays customers for that day
        const today = moment().format('dddd');
        //get all the retail customers assigned to this van
        const customers = await RetailCustomer.find({$and: [
          { blocked: false },{SupplyVan:ObjectId(van._id)}]}); 
        //filter through customers and return those who have route on today
        const todayRouteCustomers = customers.filter((customer) => {
          return customer.RouteDays.some((day) => day.date === today);
        });

        //customers sold to
        const customerSoldTo = invoice.filter((b) => {
          return (
            b.InvoiceDate === `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` && b.InvoiceStatus === "invoice"
          );
        })

        // generate sales for the month
        const salesforthemonnth = invoice.filter((b) => {
          return (
            b.InvoiceDate.charAt(0) === `${d.getMonth() + 1}`
             && b.InvoiceStatus === "invoice"
              // && b.InvoiceDate.substring(5,9) === `${d.getFullYear()} `
          );
        }).map((bill) => {
          return parseInt(bill.TotalPrice);
        })
        .reduce((total, currentValue) => {
          return parseInt(total + currentValue);
        }, 0);

        //get drivers payment for the month
          const startDate = moment().startOf('month').format('YYYY-MM-DD');
          const endDate = moment().endOf('month').format('YYYY-MM-DD');
        //get all payment for current month `${moment().format("MM")}-${moment().format("DD")}`
        const paymentfortoday = await RetailTransaction.find({
          $and: [
            // { PaymentDate: { $regex: `^${moment().format("MM").charAt(1)}/${moment().format("DD")}/${moment().format("YYYY")}` } },
            { collectionRef: "PYMT" },
            { Accountant: van.Driver },
            {cr:true}
          ],
        }).exec().then(payments =>{
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

           return payments.filter((payment)=>{
              const dates = generateDates(new Date(endDate),new Date(startDate))
              const formattedDate = moment(new Date(payment.PaymentDate)).format("DD-MM-YYYY");
              return dates.includes(formattedDate);
            })
           
        })

       
        
        const todaysPyment = paymentfortoday.map((bill) => {
          return parseInt(bill.transactionAmount);
        })
        .reduce((total, currentValue) => {
          return parseInt(total + currentValue);
        }, 0) 

        //calculate Sales_Target
        let saleTarget = 0
        let saleTargetPercentage = 0
        
        //get van driver customers
        await Employe.findById(ObjectId(van.Driver))
         .then(async (driver) => {
            const startDate = driver.Target_Start
            const endDate = driver.Deadline


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
           
            //filter through retail invoice and return only invoice that is invoice
            const invoice = await retailInvoice.find({
              vanId: van._id,
            }).exec().then((invoice)=>{
              return invoice.filter(inv =>{
                  const dates = generateDates(new Date(endDate),new Date(startDate))
                  const formattedDate = moment(new Date(inv.InvoiceDate)).format("DD-MM-YYYY");
                  return inv.InvoiceStatus ==="invoice" && dates.includes(formattedDate);
              })
            })

            saleTarget = invoice.map(value =>{
              return parseInt(value.TotalPrice)
            }).reduce((total, currentValue) => {
              return parseInt(total + currentValue);
            }, 0) 

            //get the percentage completion of saleTarget
            saleTargetPercentage = Math.round((saleTarget *100 ) / driver.Sales_Target)
          });


      res.status(200).render('./retail/SingleVan',{ van,invoice ,TodaySale,
        todayRouteCustomers,customerSoldTo,salesforthemonnth,
        todaysPyment,
        saleTarget,
        saleTargetPercentage
      });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Van not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};


module.exports.getVanDriverCustomers = async (req, res, next) => {
  try {
    // find the van driver customers
    const van = await Van.findById(ObjectId(req.query.Mycustomers));
    if (van) {  
    const Mycustomers = await RetailCustomer.find({SupplyVan:ObjectId(van._id)});
      const states = await NaijaStates.all();
      res.status(200).render('./retail/VanDriverCustomers',{ Mycustomers ,van,states});
    } else{
      res.status(404).redirect('/api/v1/404')
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Van not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// create van customers
module.exports.RetailCustomers = async (req, res, next) => {

  try{
    await RetailCustomer.create(req.body)
    .then(async (retailer)=>{
      if(retailer){
        //create opening balance transaction for new customer
        const newTransactionLog = {
          paymentReferenceNo:`${retailer.customerCode}`,
          PaymentDate:moment().format('l'),
          Accountant:ObjectId(retailer.SupplyVan),
          customer:ObjectId(retailer._id),
          customerName:retailer.name,
          transactionAmount:0,
          transactionStatus:'Posted',
          collectionRef:`Opening`,
          dr:false,
          cr:false,
          Balance:retailer.Balance
        }
        await RetailTransaction.create(newTransactionLog)
        //add email notification to salesman and accountant to veryfy account details
        res.status(200).json({ message: 'Retailer created successfully.' });
      }else{
        throw new Error('Couldn\'t create new Retailer');
      }
    })
  }catch ( errors){
    res.status(500).json({ error: errors.message });
  }
};

// get van product list
module.exports.MyProductslist = async (req,res,next) => {
  try {
    const van = await Van.findById(ObjectId(req.query.Myproducts));
    if (van) {  
      res.status(200).render('./retail/products',{van});
    } else{
      res.status(404).redirect('/api/v1/404')
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Van not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

//get van invoice 
module.exports.NewVanInvoice = async (req,res,next) => {
  try {
    const van = await Van.findById(ObjectId(req.query.van));
    if (van) {  
      const  todayRouteCustomers= await RetailCustomer.find({$and: [
        { blocked: false },{SupplyVan:ObjectId(van._id)}]}); 


        const today = moment().format('dddd');
        //filter through customers and return those who have route on today
        const Mycustomers = todayRouteCustomers.filter((customer) => {
          return customer.RouteDays.some((day) => day.date === today);
        });
      
      const Business = await companyRegister.findOne();
      res.status(200).render('./retail/Invoice',{van ,Business,Mycustomers});
    } else{
      res.status(404).redirect('/api/v1/404')
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Van not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

//get single customer for invoice 
module.exports.RetailCustom_get = async (req,res,next) => {
  try {
     await RetailCustomer.findOne({customerCode:req.query.code})
    .then(async (customer)=>{
      if (customer) { 
        await Van.findById(ObjectId(req.query.van)).then(async van =>{
          if (van){
            const newInvoice = {
              InvoiceNumber:`00${(await retailInvoice.find({vanId:van._id}).countDocuments().exec()) + 1}/${van.InvoiceReference}`,
              InvoiceDate:moment().format('l'),
              customerId:ObjectId(customer._id),
              customerName:customer.name,
              InvoiceStatus:'order',
              vanId:ObjectId(van._id),
              Discount:0,
              VAT:0,
              vanRefNumber:van.InvoiceReference
            }

            await retailInvoice.create(newInvoice)
            .then((NewVanInvoice)=>{
              if(NewVanInvoice){
                res.status(201).json({message:`/api/v1/RetailInvoice?order=${NewVanInvoice._id}`})
              }else{
                throw new Error('Couldn\'t create new Invoice');
              }
            })
            //push new invoice ino the van in voice array
            // await Van.findByIdAndUpdate(van._id, { $push: { invoice: newInvoice } }, { new: true }) 
          }
        })
  
      } else{
       throw new Error('No customer found. Plese select from list of customers available')
      }
    })
   
  } catch (error) {
      res.status(500).json({ error: error.message }); 
  }
}

//single retain invoice
module.exports.SingleRetailInvoice = async (req,res,next) => {
  try {
    const invoice = await retailInvoice.findById(ObjectId(req.query.order))
    .exec();
    if (invoice) {
      const customer = await RetailCustomer.findById(invoice.customerId)
      const Business = await companyRegister.findOne();
      const van = await Van.findById(ObjectId(invoice.vanId))
      res.status(200).render('./retail/InvoiceDetails',{ invoice,van,Business,customer});
    } else{
      res.status(404).redirect('/api/v1/404')
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Invoice not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

//get single van product for invoice
module.exports.Billvan_Product_get = async (req,res,next) => {
  try {
    await Van.findById(ObjectId(req.query.van))
    .exec().then(async(Vanproduct) => {
      const invoice = await retailInvoice.findById(ObjectId(req.query.invoice))
    .exec();
      //filter through van cart and return the product object that matches the criteria
      const product = Vanproduct.Cart.find((item) => {
        return item.productCode.toString() === req.query.code;
      });

      if (product) {

        const cartProduct = {
          product:product,
          vat: product.vat,
          tracibility:'OUT',
        }

        //check if the product is already in the cart
        const existingProduct = invoice.orders.find((item) => {
          return item.product._id.toString() === product._id.toString();
        });

        //action duplicates
       if(existingProduct === undefined) {
        await retailInvoice.findByIdAndUpdate(invoice._id, { $push: { orders:cartProduct} }, { new: true });
        res.status(200).json({message: 'Invoice updated successfully'});
       }else{
        throw new Error('Invoice update failed. Product already exist in ordered list');
       }
        //update the invoice array with the new product
        
      } else{
        throw new Error('Not Found');
      }
    })
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

//update qty requested on invoice list
module.exports.invoiceQty_put = async (req,res,next)=>{
  try{
    if(ObjectId.isValid(req.query.order_id)){

     const selected =  await retailInvoice.findById(req.query.order_id).exec().then((retailInvoice)=>{
        const product = retailInvoice.orders.find((item) => {
          return item._id.toString() === req.params.orderId;
        });
        return product
      })
      //FIND the product in the orderlist

      await retailInvoice.updateOne(
        {
          _id: req.query.order_id,
          "orders._id": req.params.orderId
        },
        {
          $set: {
            "orders.$.purchasedQty": req.body.purchasedQty,
            "orders.$.total": parseInt((req.body.purchasedQty * selected.product.priceListPrice) - selected.product.promotion),

          }
        },
      ).then(async pro=>{
        if(pro){
          //update invoice total
          const Invoice =  await retailInvoice.findById(req.query.order_id).exec()
          Invoice.TotalPrice = Invoice.orders.map(invoice =>{return parseInt(invoice.total)})
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

// update invoice status and deduct from  van cart array

module.exports.ConvertToInvoice = async (req,res,next)=>{
  try{
    let paymentRecieved = 0
    req.body.amount === null ? paymentRecieved = 0 : paymentRecieved = req.body.amount

    if(ObjectId.isValid(req.query.invoice_id)){
       await retailInvoice.findById(req.query.invoice_id).exec()
      .then(async (retailInvoice)=>{
        if(retailInvoice){
          // run a loop for all the invoices product and deduct from van cart
          retailInvoice.orders.forEach(async (order) => {

            const selected =  await Van.findById(retailInvoice.vanId).exec().then((vanCart)=>{
              const product = vanCart.Cart.find((item) => {
                return item.productId.toString() === order.product.productId.toString();
              });
              return product
            })
            
            //update the van cart product
            await Van.updateOne(
              {
                _id: retailInvoice.vanId,
                "Cart._id": selected._id
              },
              {
                $set: {
                  "Cart.$.Qty": selected.Qty - order.purchasedQty ,
                }
              },

              
            )
            //update the invoice item
            // product.tracibility = 'OUT',
            // product.save()
    
          })
          
          //update invoice status to invoice and add payment details
          retailInvoice.InvoiceStatus = 'invoice'
          retailInvoice.payment.push({
            invoiceId:retailInvoice._id,
            paymentDate:moment().format('l'),
            Amount:parseInt(paymentRecieved)
          })
          retailInvoice.save()

          //update the customer balance and create a new transaction log
          await RetailCustomer.findById(retailInvoice.customerId).then(async (customer) => {
            

            //create a new transaction log for the invoice
            const selected =  await Van.findById(retailInvoice.vanId).exec()
            const newTransactionLog =  {
              paymentReferenceNo:`INV/${retailInvoice.InvoiceNumber}`,
              PaymentDate:moment().format('l'),
              Accountant:ObjectId(selected.Driver),
              customer:ObjectId(customer._id),
              customerName:customer.name,
              transactionAmount:retailInvoice.TotalPrice,
              transactionStatus:'posted',
              collectionRef:'INV',
              dr:true,
              Balance:Math.ceil(customer.Balance ) + parseInt(retailInvoice.TotalPrice)
            }
            await RetailTransaction.create(newTransactionLog).then(async () => {
              await RetailTransaction.create(
                
                {
                  paymentReferenceNo:`PYMT/INV/${retailInvoice.InvoiceNumber}`,
                  PaymentDate:moment().format('l'),
                  Accountant:ObjectId(selected.Driver),
                  customer:ObjectId(customer._id),
                  customerName:customer.name,
                  transactionAmount:Math.ceil(parseInt(paymentRecieved)),
                  transactionStatus:'posted',
                  collectionRef:'PYMT',
                  cr:true,
                  BillId:retailInvoice._id,
                  Balance:parseInt(customer.Balance ) + parseInt( retailInvoice.TotalPrice) - parseInt(paymentRecieved)
                }
              )
            })
            
            customer.Balance = parseInt(customer.Balance ) + parseInt( retailInvoice.TotalPrice) - parseInt(paymentRecieved);
            customer.save()
          })  
          res.status(201).json({message:'Inventory has been adjusted successfully'})
        }else{
          throw new Error('Invoice not found')
        }
      })
      //send server response

     
    }else{
      throw new Error('Invalid Invoice Id')
    }
    }catch (error){
      res.status(500).json({error:error.message})
    }

  }


  //get SingleRetailCustomer 
  module.exports.SingleRetailCustomer = async (req, res) => {
    try {
      const customer = await RetailCustomer.findById(ObjectId(req.params.id))
       .exec();
      if (customer) {
        const RetailTransactions = await RetailTransaction.find({customer:ObjectId(customer._id)}).exec();
        res.status(200).render('./retail/editCustomer',{customer,RetailTransactions});
      } else {
        res.status(404).redirect('/api/v1/404');
      }
    } catch (error) {
      if (error.kind === 'ObjectId') {
        res.status(404).json({ message: 'Customer not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  //add route days to customer
  module.exports.AddDaysToCustomerRoute = async (req, res) => {
    try {
      await RetailCustomer.findByIdAndUpdate(
        req.params.id,
        {
            $push: {
              RouteDays:{
                date:req.body.date
              }
              ,
            },
        },
        // { new: true } // Return the updated document
    ).exec().then((acknowledge)=>{
      if(acknowledge){
        res.status(200).json({ message: 'Days added successfully'});
      }else{
        throw new Error('Something went wrong');
      };
    })
     
    } catch (error) {
     res.status(500).json({ error: error.message });
    }
  };


  //todays van route returns json data for calender
  module.exports.TodaysRouteCalenderApi = async (req, res, next) => {
    
    try {
      const van = await Van.findById(ObjectId(req.query.van))
       .exec();
      if (van) {
        const today = moment().format('dddd');
        //get all the retail customers assigned to this van
        const customers = await RetailCustomer.find({ SupplyVan: van._id })
        //filter through customers and return those who have route on today
        const todayRouteCustomers = customers.filter((customer) => {
          return customer.RouteDays.some((day) => day.date === today);
        });

        res.status(200).json({events:todayRouteCustomers});
        
       
      } else {
        res.status(404).redirect('/api/v1/404');
      }
    } catch (error) {
      res.status(500).json({error: error.message});
    }
     
  };


  module.exports.TodaysRouteRender =async (req,res,next) => {
    try {
      const van = await Van.findById(ObjectId(req.query.van))
       .exec();
      if (van) {
        const today = moment().format('dddd');
        //get all the retail customers assigned to this van
        const customers = await RetailCustomer.find({$and: [
          { blocked: false },{SupplyVan:ObjectId(van._id)}]}); 
        //filter through customers and return those who have route on today
        const todayRouteCustomers = customers.filter((customer) => {
          return customer.RouteDays.some((day) => day.date === today);
        });

        res.status(200).render('./retail/TodaysRoute',{todayRouteCustomers,van});
        
       
      } else {
        res.status(404).redirect('/api/v1/404');
      }
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  };

  //edit retail customer
  module.exports.RetailCustomer_Udate = async (req, res) => {
    try {
      await RetailCustomer.updateOne(
        { _id: ObjectId(req.query.customer) },
        { $set: req.body }
      ).exec()
      .then(async acknowledge => {
        if(acknowledge){
          res.status(200).json({ message: 'Customer updated successfully'});
        }else{
          throw new Error('Something went wrong');
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  //delete retail customers route date from routeDay array
  module.exports.DeleteDaysFromCustomerRoute = async (req, res) => {
    try {
      await RetailCustomer.updateOne(
        { _id: ObjectId(req.params.customerId) },
        { $pull: { RouteDays: { _id: ObjectId(req.query.date) } } }
      ).exec()
      .then(async acknowledge => {
        if(acknowledge){
          res.status(200).json({ message: 'Days deleted successfully'});
        }else{
          throw new Error('Something went wrong');
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  //delete line item from retailorder order array
  module.exports.DeleteOrderLineItem = async (req, res) => {
    try {
      await retailInvoice.updateOne(
        { _id: ObjectId(req.query.invoice) },
        { $pull: { orders: { _id: ObjectId(req.query.line) } } }
      ).exec()
      .then(async acknowledge => {
        if(acknowledge){
          //update the total of the invoice
          const Invoice =  await retailInvoice.findById(req.query.invoice).exec()
          Invoice.TotalPrice = Invoice.orders.map(invoice =>{return parseInt(invoice.total)})
          .reduce((total, currentValue) => {
            return parseInt(total + currentValue);
          }, 0);
          Invoice.save()
          res.status(200).json({ message: 'Line item deleted successfully'});
        }else{
          throw new Error('Something went wrong');
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  //cancel a retail invoice
  module.exports.ReverseInvoice = async (req, res) => {
    try {
      if (ObjectId.isValid(req.query.invoice)) {
        await retailInvoice.findById(req.query.invoice)
        .then(async (invoice) => {
          if(invoice.InvoiceStatus === 'cancelled'){
            throw new Error(`Invoice Has already been cancelled`)
          }else{
           
            // run a loop for all the invoices product and deduct from van cart
            invoice.orders.forEach(async (order) => {

              //update the cart with the order information
              const selected =  await Van.findById(invoice.vanId).exec().then((vanCart)=>{
                const product = vanCart.Cart.find((item) => {
                  return item.productId.toString() === order.product.productId.toString();
                });
                return product
              })

            //update the van cart product
            await Van.updateOne(
              {
                _id: invoice.vanId,
                "Cart._id": selected._id
              },
              {
                $set: {
                  "Cart.$.Qty": selected.Qty + order.purchasedQty ,
                }
              },

            ).then(acknowledge =>{
              if(acknowledge){
                 //set  tracibility to IN
                order.tracibility = 'IN';
                order.save({ suppressWarning: true });
              };
            })
           
           
          })
 

          //update the customer balance and create a new transaction log
          await RetailCustomer.findById(invoice.customerId).then(async (customer) => {
            
            
            //create a new transaction log for the invoice
            const selected =  await Van.findById(invoice.vanId).exec()
            const newTransactionLog =  {
              paymentReferenceNo:`RTN/INV/${invoice.InvoiceNumber}`,
              PaymentDate:moment().format('l'),
              Accountant:ObjectId(selected.Driver),
              customer:ObjectId(customer._id),
              customerName:customer.name,
              transactionAmount:invoice.TotalPrice,
              transactionStatus:'posted',
              collectionRef:'RTN',
              cr:true,
              Balance:parseInt(customer.Balance ) + parseInt(invoice.payment.map(payment => {return payment.Amount})) - parseInt( invoice.TotalPrice)
            }
            await RetailTransaction.create(newTransactionLog).then(async () => {
              // cancell payment on invoice
             await RetailTransaction.updateOne({BillId:invoice._id},              {
              $set: {
                
                "collectionRef":"RTN"
              }
            },)
              customer.Balance = parseInt(customer.Balance ) + parseInt(invoice.payment.map(payment => {return payment.Amount})) - parseInt( invoice.TotalPrice)
              customer.save()
              //update invoice status to invoice and add payment details
              invoice.InvoiceStatus = 'cancelled';
              invoice.save()
              res.status(201).json({message:'Inventory has been adjusted successfully'})
            })
            
          }) 
          

          }
        })
      }
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: error.message });
    }
  };

  //settings for van page
  module.exports.vanSettings = async (req, res) => {
    try {
      const van = await Van.findById(ObjectId(req.query.van))
       .exec();
      if (van) {
        //get the driver assigned to the van
        const driver = await Employe.findById(ObjectId(van.Driver)).exec();
        const employees = await Employe.find({$and: [
          { status: "active" },{isManager: false}]})
    
          const manager = await Employe.find({$and: [
            { status: "active" },{isManager: true}]})
    
          const Locations = await WHouse.find({$and: [
            { Status: true }]})
        res.status(200).render('./retail/VanSettings',{van,driver,employees,manager,Locations});
      } else {
        res.status(404).redirect('/api/v1/404');
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  //edit single van
  module.exports.Van_Update = async (req, res) => {
    try {
      await Van.updateOne(
        { _id: ObjectId(req.query.vanId) },
        { $set: req.body }
      ).exec()
      .then(async acknowledge => {
        if(acknowledge){
          res.status(200).json({ message: 'Van updated successfully'});
        }else{
          throw new Error('Something went wrong');
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  //get all retail customer assigned to various van
  module.exports.ManagerCustomer = async (req, res) => {
    try {
      const customer = await RetailCustomer.find()
      .exec();
        res.status(200).render("./retail/ManagerList",{customer});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  //json list of retail customer
  module.exports.ManagerCustomerList = async(req,res) =>{
    const retailCustomers = await RetailCustomer.find().sort({status:1})
    res.status(200).json({retailCustomers:retailCustomers})
  }

  module.exports.VanpaymentCSV = async(req,res) =>{
    try{
      await Van.findOne({$and: [{_id:ObjectId(req.query.van)}]})
      .exec().then(async van =>{
       const Vancustomers = await RetailCustomer.find({$and: [{SupplyVan:ObjectId(van._id)},{status:true}]})
       const transactions = await RetailTransaction.find({$and:[{Accountant:van.Driver}]})
       res.status(200).render("./retail/Payments",{van,Vancustomers,transactions});
      })
    }catch(error){
      res.status(500).json({ error: error.message });
    }

    //downloads csv file with json data
    // const csv = JSON.stringify({ data: retailCustomers, fields: ['_id', 'name', 'phone', 'email', 'address', 'status'] });
    // res.attachment('retailCustomers.csv');
    // res.status(200).send(csv);
  }

  //get single invoice to download in pdf format
  module.exports.DownloadInvoicePdf = async(req,res) =>{
    try{
      await retailInvoice.findById(req.params.id)
      .exec().then(async invoice =>{
       res.status(200).json(invoice);
      })
    }catch(error){
      res.status(500).json({ error: error.message });
    }
  }

  //add payment to customer ledger
  module.exports.updatePayment = async(req,res) =>{
    try{
      await RetailCustomer.findById(req.query.CustomerId).exec()
      .then(async customer =>{
        if (customer){
          await RetailCustomer.updateOne({_id :customer._id},
            { $set: {Balance : parseInt(customer.Balance) - parseInt(req.body.Amount) } },
            { new: true }
          ).exec().then(async acknowledge =>{
            if(acknowledge.modifiedCount  === 1){
              //generate 5 random numbers
              // const paymentRef = Math.floor(100000 + Math.random() * 900000);
              //GENERATE random characters
              const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              const paymentCode = Array.from({ length: 5 }, () => randomChars.charAt(Math.floor(Math.random() * randomChars.length))).join('');
              //create payment entry in ledger 
              await RetailTransaction.create(
                
                {
                  paymentReferenceNo:`PYMT/RECEIVED/${paymentCode}`,
                  PaymentDate:moment().format('l'),
                  Accountant:ObjectId(req.query.user),
                  customer:ObjectId(customer._id),
                  customerName:customer.name,
                  transactionAmount:Math.ceil(parseInt(req.body.Amount)),
                  transactionStatus:'posted',
                  collectionRef:'PYMT',
                  cr:true,
                  BillId:'',
                  Balance:parseInt(customer.Balance ) - parseInt( req.body.Amount)
                }
              )
              res.status(201).json({message:`Payment successful with transaction details Recorded as ${paymentCode}`})
            }else{
              throw new Error('Something went wrong');
            }
          })
        }else{
          throw new Error('Something went wrong');
        }
      })
    }catch(error){
      res.status(500).json({ error: error.message });
    }
  }

  //detete order route
  module.exports.deleteOrder = async(req,res) =>{
    try{
      await retailInvoice.findById(req.query.invoice).exec()
      .then( async order =>{
        if (order.InvoiceStatus === 'order'){
          await retailInvoice.findByIdAndDelete(order._id)
          .exec().then(async acknowledge =>{
            if(acknowledge){
              res.status(200).json({message:'Invoice deleted successfully'})
            }else{
              throw new Error('Something went wrong');
            }
          })
        }else{
          throw new Error(`Oops, ${order.InvoiceStatus}/${order.InvoiceNumber} status has been converted to ${order.InvoiceStatus}`);
        }
      })
      
    }catch(error){
      res.status(500).json({ error: error.message });
    }
  }

  //get and display single retail payment 
  module.exports.SingleretailPay = async(req,res) =>{
    try{
      await RetailTransaction.findById(ObjectId(req.query.payment))
      .exec().then(async payment =>{
        if (payment){
        const customer =  await RetailCustomer.findById(ObjectId(payment.customer))
        const acccountant = await Employe.findById(ObjectId(payment.Accountant))
        res.status(200).render('./retail/SingleRtailPayments',{payment,customer,acccountant})
        }else{
          throw new Error('Not found');
        }
      })
    }catch(error){
      res.redirect('/api/v1/404')
    }
  }

  //reverse retail payment
  module.exports.retailPaymentReturn = async(req,res) =>{
    try{
      await RetailTransaction.findById(req.query.id).exec()
      .then(async payment =>{
        await RetailCustomer.findById(ObjectId(payment.customer)).exec()
        .then(async customer =>{
          if (customer){
            await RetailCustomer.updateOne({_id :customer._id},
              { $set: {Balance : parseInt(customer.Balance) + parseInt(payment.transactionAmount) } },
              { new: true }
            ).exec().then(async acknowledge =>{
              if(acknowledge.modifiedCount  === 1){
                await RetailTransaction.create(
                  {
                    paymentReferenceNo:`RETURNED/${payment.paymentReferenceNo}`,
                    PaymentDate:moment().format('l'),
                    Accountant:ObjectId(req.query.user),
                    customer:ObjectId(payment.customer),
                    customerName:customer.name,
                    transactionAmount:Math.ceil(parseInt(payment.transactionAmount)),
                    transactionStatus:'posted',
                    collectionRef:'RTN',
                    dr:true,
                    BillId:'',
                    Balance:parseInt(customer.Balance) + parseInt(payment.transactionAmount)
                  }
                ).exec().then(async acknowledge =>{
                  if(acknowledge){
                    payment.collectionRef = 'RTN'
                    payment.status = 'canceled'
                    payment.save()
                    res.status(200).json({message:'Payment reversed successfully'})
                  }else{
                    throw new Error('Something went wrong');
                  }
                })
              }else{
                throw new Error('Something went wrong');
              }
            })
          }else{
            throw new Error('Something went wrong');
          }
        })
      })
    }catch(error){
      res.status(500).json({ error: error.message });
    }
  }
    