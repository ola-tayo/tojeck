const { Router } = require('express');
// Import dependencies
const YAML = require("js-yaml");
const multer = require("multer");
const product = require('../modules/Product');
const authController = require('../controllers/authControllers')
const DepreciationController = require('../controllers/DepreciationShedule')
const {requireAuth,checkUser,QrcodeInvoicer,checkUserStatus,useIp} = require('../middleware/authmidddleware')
const {deductLeaveDays} = require('../middleware/TimeoffMiddleware')
const {PostInvoice,ValidStockTransfer,VanViews,adminWareHouseSetUp,createVendor,
        OpenOrder,checkUserLocation,AccountantViewAccess,removeStock,RefundCustomer,
        updateStockCount,CheckDriver,checkReturnedInvoice,PostPayment
      } = require('../warehouseValidation/warehouseValidate')
const {checkResetUser,checkLoginUser} = require('../middleware/checkUser')
const {checkUserRole,ManagerAccess} = require("../middleware/userRole");
const bills = require('../modules/Bills');
const NotifyManagerPayment = require('../Functions/NotifyManager');
const restPassword = require("../Functions/resetPasword");
const fs = require('fs');
const sendQuot = require("../Functions/sendQuot");
const pdf = require("pdf-creator-node");
const { ObjectId } = require('mongodb');
const NotifyAccountant = require('../Functions/NotifyAccountant');
const employe = require('../modules/Employees')
const customer = require('../modules/customers')
const NotifyScrap = require('../Functions/NotifyScrap')
const NotifyWhTovir = require('../Functions/NotifyWhTovir')
const NotifyCFORetruns = require("../Functions/NotifyCFORetruns");//for cfo
const WelcomeMessageHandler = require('../Functions/WelcomeMessageHandler')
const NotifyAccountantPR = require("../Functions/NotifyAccountantPR");//for Accountant
const NotifyCFOTransfer = require("../Functions/NotifyCFOTransfer");//for Accountant
const ScrapResponse = require('../Functions/ScrapResponse')
const NotifyCustomerIncentive = require('../Functions/NotifyCustomerIncentive');
const NotifyCFOPriceChange = require("../Functions/PriceChangrNootification");//for Accountant
const XLSX = require('xlsx');

const router = Router()

router.get('*',checkUser)
router.get('/signup',checkUserStatus,requireAuth,authController.signup_get);
router.get('/SignIn',authController.signin_get);
router.get('/Cart',authController.cart_get);
router.get('/index',authController.index_get);//check this out
router.get('/contact_form',DepreciationController.contact_form_get);
router.post('/contact_form_submit',DepreciationController.contact_form_post)
router.get('/Livechat/Link/:chatId',DepreciationController.Livechat_get)//get single link for support ticket from mail
router.get('/livechat/updates/:chatId',DepreciationController.chatUpdate_get)//for update on dom
router.put('/chat/:chatId',DepreciationController.chat)//to add chat to livechat
router.get('/Helpdesk',checkUserStatus,requireAuth,DepreciationController.TicketView_get)///internal user view 
router.get('/Ticket',checkUserStatus,requireAuth,DepreciationController.SingleTicket)//get single ticket
router.patch('/TicketId',checkUserStatus,requireAuth,DepreciationController.TicketId_patch)//edit single ticket
router.get('/Support',checkUserStatus,requireAuth, DepreciationController.SupportDepartment)
router.get('/Marketing',checkUserStatus,requireAuth,DepreciationController.Marketing_get);//productivity
router.post('/Productivity/sendMarketing',checkUserStatus,requireAuth,DepreciationController.Marketing_post);
router.get('/Notification/:WHID',checkUserStatus,requireAuth,authController.Notification_get);
router.get('/Notifications/:employeeId',checkUserStatus,requireAuth,DepreciationController.UserNotification_get);
router.get('/Reset',authController.Reset_get);
router.get('/logout/:USERID',checkUserStatus,requireAuth,authController.logout_get);
router.get('/employee',checkUserStatus,requireAuth,authController.OnboardEmployee_get)
router.get('/Appraisal/:id',checkUserStatus,requireAuth,authController.Appraisal_get)//GET SINGLE EMPLOYEE FOR APPRAISAL
router.post('/Appraiasl/Employee/Apraisal',checkUserStatus,requireAuth,authController.Appraisal_post)
router.get('/Appraisals/Management/:id',checkUserStatus,requireAuth,authController.AppraisalsManagement_get)//for top management view    

router.post('/register/employee',checkUserStatus,requireAuth,authController.Register_post);//to create new employee but not activated
router.get('/employee/:EmployeeId/user',checkUserStatus,requireAuth,authController.getSingleEmployee_get)
router.post('/SignIn',checkLoginUser,authController.signin_post);
router.get('/Reset/account/:EmailTOreset',authController.ResetEmail_get,restPassword);
router.post('/Register-lead',checkUserStatus,requireAuth,authController.Lead_post);
router.patch('/Reset-password/:id/Security',authController.ResetId_patch);
router.patch('/employee/Onboard/:EmployeeId',checkUserStatus,requireAuth,authController.OnboardEmployee_patch)//patch request for employee login

router.get('/employee/:employeeId',checkUserStatus,requireAuth,async(req,res)=>{//get json for all employees
    const employee = await employe.findById(new ObjectId(req.params.employeeId))
    res.status(200).json(employee)
})
//for erp pls cut out when done 

router.post('/Product/Create-new',checkUserStatus,requireAuth,authController.ProductCreate_post);
router.get(`/product/:ACDcode/bill/:WHID`,checkUserStatus,requireAuth,authController.productFind_get);//get store product id with json format for quotation purposes
router.get('/product/:ACDcode/bill',checkUserStatus,requireAuth,authController.productFindNodIde_get)//get product  with json format for quotation purposes
router.get('/StoreProductFindNodIde/:ACDcode/:to/:from',checkUserStatus,requireAuth,authController.StoreProductFindNodIde_get)//FOR WAREHOUSE PRODUCT TRANSFER 
router.get('/Products',checkUserStatus,requireAuth,authController.Product_get);
router.patch('/:id/BuyingPrice_change',checkUserStatus,requireAuth,authController.BuyingPrice_change,NotifyCFOPriceChange);//buying price change
router.patch('/Products/:id/edit',checkUserStatus,requireAuth,authController.Product_patch);
router.patch('/Products/:id/return',checkUserStatus,requireAuth,authController.ProductReturn_patch,NotifyWhTovir)//return product to virtual and logs message 
router.get('/Product/:id',checkUserStatus,requireAuth,authController.SingleProduct_get)
router.get('/Product/search/:referenceNo',checkUserStatus,requireAuth,authController.SingleProductAdc_get) //for search
router.get('/Clone/Product/:PRODUCTID',checkUserStatus,requireAuth,authController.SingleProductClone)
router.get('/StoreProduct/:PRODUCTID/edit',checkUserStatus,requireAuth,authController.StoreProductUpdate)

router.get('/Ecommerce/Customers',checkUserStatus,requireAuth,authController.Customer_get);
router.get('/GetAllCstomers',checkUserStatus,requireAuth,authController.GetAllCstomers)//returns a list of customers in json format
router.post('/Sales/Register-customer',checkUserStatus,requireAuth,authController.CustomerRegister_post)
router.get('/customer/:id/search',checkUserStatus,requireAuth,authController.CustomerFind_get);
router.get(`/customer/:id/edit`,checkUserStatus,requireAuth,authController.customer_get);
router.patch(`/customer/update/:id`,checkUserStatus,requireAuth,authController.customerEdit_patch)

router.get('/VIRTUAL/Vendors/:ADMINID',checkUserStatus,requireAuth,adminWareHouseSetUp,authController.Vendors_get);
router.post('/Sales/Register-Vendor/:ADMINID',checkUserStatus,requireAuth,createVendor,authController.VendorCreate_post);

//for payment 
router.get('/Sales/Payment/Home/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.paymentLanging_get)
router.get('/Register/bill/:id/:billId',checkUserStatus,requireAuth,authController.RegisterPayment_get)//acountatnt is and bill id
router.patch('/bill/register/:id',checkUserStatus,requireAuth,authController.RegisterPayment_patch,NotifyManagerPayment)//register bill 
router.get('/Pay_Vendor/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.VendorPayment_get)
router.post('/Pay_Vendor_incentive/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.INCENTIVEPayment_post,NotifyCustomerIncentive)
router.patch('/vendor_balance/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.VendorBalance_patch)//register vendor balance
router.patch('/Reverse/Balance/:id/:paymentId',checkUserStatus,requireAuth,AccountantViewAccess,authController.VendorPayment_Patch)//reverse custormer balance and update vendor balance

//warehouseops
router.get('/warehouse/:id/employeeLocation',checkUserStatus,requireAuth,ValidStockTransfer,authController.warehouse_get);
router.post('/warehouse/create-new',checkUserStatus,requireAuth,authController.wareHouse_post);
router.get('/Location/:id',checkUserStatus,requireAuth,authController.warehouseDelivery_get);//id refrences user id
router.get('/deliveryExcel/:WHID',checkUserStatus,requireAuth,authController.deliveryExcel_get);//get all delivery in excel
router.get('/Delivery/Excel/:DeliveryId',checkUserStatus,requireAuth,authController.SingleDeliveryExcel_get)
router.get('/wHBills/Excel/:WHID',checkUserStatus,requireAuth,authController.wareHouseBillExcel_get)//for ware house 
router.get('/XLSX/Report/:WHID',checkUserStatus,requireAuth,authController.InventoryReport_get)//for excell
router.get('/warehouse/:id/Invoices/new',checkUserStatus,requireAuth,authController.Invoice_get);
router.get('/stock-move',checkUserStatus,requireAuth,authController.stock_get);//for inventory move
router.get('/VirtualstorageProduct',checkUserStatus,requireAuth,authController.VirtualstorageProduct_get)//add url to frontend today
router.patch('/warehouse/:ADMINID/:WHID/edit',checkUserStatus,requireAuth,adminWareHouseSetUp,authController.Edit_patch);//edith ware house 
router.patch('/outbound/:ADMINID/:WHID/:PRODID/:STOREID/edit',checkUserStatus,requireAuth,adminWareHouseSetUp,authController.Inventory_patch);
router.post(`/wareHouseToTransfer/:WHID`,checkUserStatus,requireAuth,authController.WareHouseStoreage_post);//here to register new product toWareHouse
router.post(`/wareHouseToTransfer/toRecive`,checkUserStatus,requireAuth,authController.WareHouseStock_post);//use this for deliveries
router.post('/wareHouse/Bill',checkUserStatus,requireAuth,PostInvoice,authController.WareHouseBill_post,removeStock,NotifyAccountant);//to post bill
router.get(`/warehouse/:id/Bills`,checkUserStatus,requireAuth,authController.WareHouseBill_get);//GET BILL BY WAREHOUSE ID
router.get(`/bill/:id`,checkUserStatus,requireAuth,authController.WareHouseSingleBill_get);//get single bill
router.patch(`/bill/:id/approved`,checkUserStatus,requireAuth,authController.approveBill_patch);//to approve bills for manager to cfo
router.get('/warehouse/Product/:whId',checkUserStatus,requireAuth,authController.WareHouseStoreage_get);//get products for specific ware house
router.patch('/warehouse/Product/:whId',checkUserStatus,requireAuth,authController.WareHouseStoreage_patch);
router.get('/Sub/:ADMINID/WareHouse/Location',checkUserStatus,requireAuth,adminWareHouseSetUp,DepreciationController.SubLocation_get)//locaton page get
router.post('/Location/create',checkUserStatus,requireAuth,DepreciationController.LocationCreate)//post api or location
router.post('/KPI/create',checkUserStatus,requireAuth,DepreciationController.KPICreate)//post api or KPI
router.get('/:id/Appraisal/',checkUserStatus,requireAuth,authController.SingleAppraisal_get)//get single appraisal
router.patch('/:id/Appraisal/',checkUserStatus,requireAuth,authController.SingleAppraisal_patch)//edit appraisal
router.get('/workContracts/',checkUserStatus,requireAuth,authController.WorkContract_get)//hr stuff
router.post('/workContracts/',checkUserStatus,requireAuth,authController.workContract_post)
router.get('/TimeOFF/:userId',checkUserStatus,requireAuth,authController.TimeOFF_get)//hr stuff
router.get('/TimeOFF',checkUserStatus,requireAuth,authController.SingleTimeOff)//get single time off
router.post('/leaveRequests',checkUserStatus,requireAuth,authController.leaveRequests_post)
router.patch('/leaveRequest',checkUserStatus,requireAuth,authController.leaveRequests_patch,deductLeaveDays)//add payroll here
router.get('/Calendar',checkUserStatus,requireAuth,DepreciationController.Calendar_get)//for event 
router.post('/New/Event/',checkUserStatus,requireAuth,DepreciationController.EventCreate)//create events

// Setup Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination where the files should be stored on disk
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        // Set the file name on the file in the uploads folder
        cb(null, file.fieldname + ".xlsx" ) ;
    },
    
  });
  

const upload = multer({ storage: storage }); // { destination: "uploads/"}

router.post("/uploadbulk",checkUserStatus,requireAuth,upload.single("data"), (req, res) => {
    try {
        // Read the workbook
        const workbook = XLSX.readFile('./uploads/data.xlsx');
        
        // Get the sheet names
        const sheetNames = workbook.SheetNames;
        
        // Get the data from the first sheet (assuming it's named "Sheet1")
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        
        // Process the data (for example, log each person's name and age)
        data.forEach(async products => {
          await product.create({
            Name:products.SKU_Name,
            ACDcode:products.PRODUCT_CODE,
            category: products.CATEGORY,
            TotalSale: 0,
            Van_Price:products.VAN_PRICE,
            Market_Price:products.SUPER_MARKET_PRICE,
            WareHouse_Price:products.WAREHOUSE_PRICE,
            Rolls:products.ROLL_IN_CARTON,
            Pieces: 0,
            Sellable: true,
            Ecom_sale: false,
            VanPromo: 0,
            WholesalePromo: 0,
            MarketPromo: 0,
            Vendor: '65f65fa961130be9580e869b',
            vendor_Price:0
          } )
        });

        // Delete the file after we're done using it
        fs.unlinkSync(`./uploads/data.xlsx`);
        res.redirect('/api/v1/Products')
        
          } catch (error) {
            error ? res.redirect('/api/v1/404') : ''
          }
});//upload multiple documents


router.get('/Employee/:employeeId',checkUserStatus,requireAuth,authController.WareHouseManager_get)
router.get('/SetUp/:WHID/:ADMINID',checkUserStatus,requireAuth,adminWareHouseSetUp,authController.WareHouseSetup_get)

// delivery routes
router.get('/delivery/:deliveryId',checkUserStatus,requireAuth,authController.delivery_get);//sends json response for single bills
router.patch('/delivery/:deliveryId/:id',checkUserStatus,requireAuth,authController.delivery_patch);//update delivery status of bill
// GENERATE PDF FOR BILL
router.get('/invoice/:billId',checkUserStatus, requireAuth,async (req, res, next)=>{
    const bill = await bills.findById(new ObjectId(req.params.billId)).limit(1).lean()
    const customers = await customer.findById(new ObjectId(bill.customer)).limit(1).lean()
    res.status(200).json({bill,customers})
    
//     const template = fs.readFileSync("./quotationTemplate.html", "utf-8");
//    const option ={
//     format:'a5',
//     orientation:'portrait',
//     border:'5mm'
//    }

//    const document = {
//     html:template,
//     data: bill//uses template for handle bars
//     ,
//     path:`./invoice/INV${bill.billReferenceNo}.pdf`,
//    }
//    await pdf.create(document,option).then((pdf) => {
//     res.status(200).download(`./invoice/INV${bill.billReferenceNo}.pdf`)
//    })
//    .catch((err) => {
//     res.status(500).send({error: err.message})
//    })
} )




//get user signature
router.get(`/users/:userId/:opInput`,checkUserStatus,requireAuth,authController.Signature_get);


// send mail to  customer   account
router.get(`/sendmail/:id/:ActiveUserName`,checkUserStatus,requireAuth,authController.sendMail,sendQuot);


router.get("/Dashboard/:userid",checkUserStatus,checkUserStatus,requireAuth, authController.Dashboard_get);

router.get(`/vendor/:id/edit`,checkUserStatus,requireAuth,authController.vendor_get);
router.patch(`/vendor/update/:id`,checkUserStatus,requireAuth,authController.vendorEdit_patch);

//reporter routes
router.get('/Report',checkUserStatus, requireAuth,authController.Report_get);
router.get('/getInvoiceRecords',checkUserStatus,requireAuth,authController.getInvoiceRecords)
router.get('/customerReport/Generate',checkUserStatus,requireAuth,authController.getCustomerReportGenerate)
router.get('/CashFlow/report',checkUserStatus,requireAuth,authController.CFR_get);
router.get('/Sale/Report',checkUserStatus,requireAuth,authController.SaleReprot_get);
router.get('/Getfulldb',checkUserStatus,requireAuth,authController.getFullDB);
router.get('/dispach/Report',checkUserStatus,requireAuth,authController.DispatchReprot_get);
router.get('/Debtor/Report',checkUserStatus,requireAuth,authController.DebtorReprot_get);
router.get('/LPO/Report',checkUserStatus,requireAuth,authController.LPOReprot_get);
router.get('/customer/report',checkUserStatus,requireAuth,authController.CustomerTransaction_get);
router.get('/StockReport',checkUserStatus,requireAuth,authController.StockReprot_get)
router.get('/Bank/Transaction',checkUserStatus,requireAuth,authController.BankTransaction_get);
router.get('/TGT/Achievement',checkUserStatus,requireAuth,authController.TGT_get);
router.get('/Expense/Report',checkUserStatus,requireAuth,authController.ExpenseReport_get);
router.get('/SalesDump/Report',checkUserStatus,requireAuth,authController.SalesDump_get);
router.get('/vendor/report',checkUserStatus,requireAuth,DepreciationController.vendorTransactionReport)
router.get('/VAT/Reprot',checkUserStatus,requireAuth,DepreciationController.VAT_REPORT)


//getting work book to exce; for All bills
router.get('/bills/excel',checkUserStatus,requireAuth,authController.BillsWorkBook_get)
router.get('/ExcelProduct',checkUserStatus,requireAuth,authController.ExcelProduct_get)

//warehouse expense
// router.get('/Expense/:WHID',requireAuth,authController.expense_get)
router.post('/Expense/:id',checkUserStatus,requireAuth,authController.expense_post)//id is user id

//SCRAP API
router.get('/Scrap/:WHID',checkUserStatus,requireAuth,authController.scrap_get)
router.post('/Scrap/:WHMANAGER',checkUserStatus,requireAuth,ManagerAccess,authController.Scrap_post,NotifyScrap)

router.get('/Staff/:WHID',checkUserStatus,requireAuth,authController.staff_get)//get staff by the location 
router.get('/Replenish/:WHID/storeproduct',checkUserStatus,requireAuth,authController.replenish_storeproduct)
router.get('/warehouse/purchase/:WHID',checkUserStatus,requireAuth,authController.wareHouse_BeamCard)//for stock count
router.get('/stockCard/:id',checkUserStatus,requireAuth,DepreciationController.Singlecard_get)//get single stock card entery
router.post('/updateStockCount',checkUserStatus,requireAuth,updateStockCount,DepreciationController.updateStockCount)
router.get('/Returns/:WHID',checkUserStatus,requireAuth,authController.WareHouseReturns_get)


// virtual warehouse routes
router.get('/VIRTUAL/:ADMINID',checkUserStatus,requireAuth,authController.virtual_get)
router.get('/VIRTUAL/SCRAP/:ADMINID',checkUserStatus,requireAuth,adminWareHouseSetUp,authController.virtual_Scrap)
router.get('/scrap/single/:ID',checkUserStatus,requireAuth,authController.SingleScrap_get)
router.patch('/scrap/:ID',checkUserStatus,requireAuth,authController.SingleScrap_patch,ScrapResponse)
// router.get('/register/new/product',requireAuth,authController.CreateProduct_get);//create product
router.get('/Delete/:ProductId',checkUserStatus,requireAuth,authController.Product_delete);
router.get('/VIRTUAL/Purchase/:ADMINID',checkUserStatus,requireAuth,authController.PurchaseLanding_get)
//purchse routers
router.get('/Virtual/Purchase/Order/:ADMINID',checkUserStatus,requireAuth,authController.PurchaseRequestForm_get)//for accountant and lpo raiser
router.post('/vendor/:id',checkUserStatus,requireAuth,authController.vendorFind_post)// kept at mind cant find url
router.get("/Virtual/Purchase/Request/:ADMINID",checkUserStatus,requireAuth,authController.PurchaseRequest_get)
router.put('/VendorProduct/lpo',checkUserStatus,requireAuth,authController.PurchaseOrderProductAdd)//add postinvoice middleware to this route
router.delete('/RemoveLinePo',checkUserStatus,requireAuth,authController.PurchaseOrderProductRemove)
router.patch('/updateLinePo',checkUserStatus,requireAuth,authController.PurchaseOrderProductUpdate)//update lpo qty
router.patch('/VendorBillPost',checkUserStatus,requireAuth,authController.PurchaseOrderUpdate)//for invoicer to update stautus from draft to pending
router.get('/Purchase/bill/:billReferenceNo',checkUserStatus,requireAuth,authController.SinglePurchasebillReferenceNo_get)//single po
router.get('/Virtual/Product/TransferLogs/:ADMINID',checkUserStatus,requireAuth,authController.productTransferLogs_get)// for transfers to warehouse log
router.get('/Virtual/Product/TransferForm/:ADMINID',checkUserStatus,requireAuth,authController.ProductTransferForm_get)
router.post('/TransferForm/:ADMINID',checkUserStatus,requireAuth,authController.ProductTransferForm_post,NotifyCFOTransfer)//transfer log to warehouse
router.patch('/Transfer/:id',checkUserStatus,requireAuth,authController.ProductTransferForm_patch);//transfer to warehouse
router.get('/warehouse/json/:WHID',checkUserStatus,requireAuth,authController.wareHouseJson_get)//SENDS WHID,STOREPRODUCT PER WHID,PRODUCT LIST for transfer
router.get('/Transfer/:TRANSFERREF',checkUserStatus,requireAuth,authController.SingleProductTransfer_get)//get single warehouse products transfer log
router.get('/Transfers/:WHNAME/:WHID',checkUserStatus,requireAuth,authController.WHProductTransfer_get)//get product by warehouse product transfer log
router.post('/Stocks/request',checkUserStatus,requireAuth,authController.StockRequest_post,NotifyAccountantPR)//ware house stock request post
router.get('/bill/:billReferenceNo/:WHID',checkUserStatus,requireAuth,authController.Return_json)//for returns generic to ware house
router.post('/returns/:whid',checkUserStatus,requireAuth,authController.Returns_post,NotifyCFORetruns)
router.get('/LPO/:WHID',checkUserStatus, requireAuth,authController.WareHouseLPO_get)//get all lpo by warehouse
router.get('/PR/:whid', checkUserStatus,requireAuth,authController.purchaseRequest_get) //get all pR

//API for all storeproduct per warehouse
router.get('/api/product/bill/:WHID',checkUserStatus,requireAuth, authController.StoreProduct_get)
// API FOR CRCODE PRODUCT ADD TO CART
router.get('/StoreProduct/:storeProductId/:WHID',checkUserStatus,requireAuth,QrcodeInvoicer,DepreciationController.QrScanner);// get and add product via qr code to in voice
router.get('/AUTOMATED_INVOICING/:WHID',checkUserStatus,requireAuth,DepreciationController.AUTOMATED_INVOICING)
router.post('/AUTOMATED_INVOICING/create',checkUserStatus,requireAuth,PostInvoice,DepreciationController.AutomatedInvoice_post)
router.get('/Single/AUTOMATED_INVOICING',checkUserStatus,requireAuth,DepreciationController.SingleAUTOMATED_INVOICING)
router.get('/smartinvoice',checkUserStatus,requireAuth,DepreciationController.SmartInvoice)

// SET UP COMPANY details



router.get('/Company/Register/:ADMINID',checkUserStatus,requireAuth,authController.companyRegister_get)
router.post('/company/register/:ADMINID',checkUserStatus,requireAuth,authController.companyRegister_post,WelcomeMessageHandler);
// expense routes
router.get('/CFO/EXPENSE/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.CFexpense_get)
router.patch('/Expense/edit/:EXPID/:CFOID',checkUserStatus,requireAuth,authController.SingleExpense_patch)
router.get('/CFO/Returns/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.CFOReturns_get)
router.get('/:RETURNID/Returns',checkUserStatus,requireAuth,authController.SingleReturns_get)
router.patch('/SingleReturn/:SingleReturnId',checkUserStatus,requireAuth,checkReturnedInvoice,authController.SingleReturns_patch,RefundCustomer)
router.patch('/Vendor/Bill/:BillId',checkUserStatus,requireAuth,authController.CFOVendorBill_patch)// for lpo
router.post('/Vendor/payment',checkUserStatus,requireAuth,authController.CFOVendorPayment_post)//post payment to vendor ledger without lpo
router.get('/EXP/:id',checkUserStatus,requireAuth,authController.SingleExpense_get)
router.get('/AccountSettingLanding/:id',checkUserStatus,requireAuth,AccountantViewAccess,authController.AccountSettingLanding_get)
router.get('/:id/:name/:Account',checkUserStatus,requireAuth,AccountantViewAccess,authController.SingleAccount_get)
router.post('/Bank/Account/create',checkUserStatus,requireAuth,authController.BankAccount_post)
router.patch('/Bank/:Account/BalanceTransfer',checkUserStatus,requireAuth,authController.BankAccount_patch)

// accountant routes
router.get('/Credit/customers/:id/payment',checkUserStatus,requireAuth,AccountantViewAccess,authController.CreditCustomers_get)//register payment
router.get('/payments/:id',checkUserStatus,requireAuth,authController.singlePayment_get)//get single payment
router.get('/GetAllpayments',checkUser,requireAuth,authController.creditPaymentsJson_get)//get all payment
// payment reversal routs
router.patch('/payment/revoke/:paymentId',checkUserStatus,requireAuth,PostPayment,authController.paymentRevoke_patch)
router.post('/CREDIT/log',checkUserStatus,requireAuth,authController.registerCustomerPayment_post)
router.get('/Profit&lost/:id',checkUserStatus,requireAuth,authController.pnl_get)

// category route
router.post('/Category/create',checkUserStatus,requireAuth,authController.productCategory)
router.post('/umo/create',checkUserStatus,requireAuth,authController.umo)
router.post('/expense/Category/create',checkUserStatus,requireAuth,authController.ExpenseCategory)
router.get('/expenseCategory/delete',checkUserStatus,requireAuth,authController.ExpenseCategory_delete)
router.get('/Category/delete/:CATID',checkUserStatus,requireAuth,authController.deleteProductCategory)

//for searching 
router.get('/query/:query',authController.query_get)
//try invoicing


// asset Register routes
router.get('/asset/:id',checkUserStatus,requireAuth,AccountantViewAccess,DepreciationController.asset_get)
router.post('/createAsset',checkUserStatus,requireAuth,DepreciationController.asset_post_create)
router.get('/SingleAsset/:AssetId/:name/:id',checkUserStatus,requireAuth,DepreciationController.SingleAsset)
router.patch('/assets/:AssetId/edit',checkUserStatus,requireAuth,DepreciationController.Asset_Patch)
router.get('/Birthday/messages',checkUserStatus,requireAuth,DepreciationController.BirthdayMessage)
router.post('/newjobtitle',checkUserStatus,requireAuth,DepreciationController.jobtittle_post)//create job title
router.post('/departmentforms',checkUserStatus,requireAuth,DepreciationController.Department_post)//create department
router.get('/Departments',checkUserStatus,requireAuth,DepreciationController.getDepartments)//get all departments


// retail routes
router.get('/POS/dashboard/',checkUserStatus,requireAuth,VanViews,DepreciationController.getPosDashboard)
router.post('/POS/NeWVan',checkUserStatus,requireAuth,DepreciationController.vanCreation)//add admin user checke fuction
router.get('/POS/Van',checkUserStatus,requireAuth,DepreciationController.SingleVan)
router.get('/Mycustomers',checkUserStatus,requireAuth,DepreciationController.getVanDriverCustomers)
router.get('/Myproducts',checkUserStatus,requireAuth,DepreciationController.MyProductslist)
router.post('/new/Retailer',checkUserStatus,requireAuth,DepreciationController.RetailCustomers)//create new retailer
router.get('/New/Invoice',checkUserStatus,requireAuth,DepreciationController.NewVanInvoice)//display page for invoice creation
router.get('/Retail_customer/',checkUserStatus,requireAuth,checkUserLocation,OpenOrder,DepreciationController.RetailCustom_get)//get customer and create invoice
router.get('/RetailInvoice',checkUserStatus,requireAuth,DepreciationController.SingleRetailInvoice)
router.get('/van_Product',checkUserStatus,requireAuth,DepreciationController.Billvan_Product_get)
router.put('/van_Product/update_order_qty/:orderId',checkUserStatus,requireAuth,DepreciationController.invoiceQty_put)
router.post('/Vaninvoice',checkUserStatus,requireAuth,DepreciationController.ConvertToInvoice)
router.get('/retailer/:id',checkUserStatus,requireAuth,DepreciationController.SingleRetailCustomer)
router.put('/customer/:id/routeDay',checkUserStatus,requireAuth,DepreciationController.AddDaysToCustomerRoute)//add visitation days to a custome
router.get('/Todays/Visit',checkUserStatus,requireAuth,DepreciationController.TodaysRouteRender)
router.get('/Todays/Route/',DepreciationController.TodaysRouteCalenderApi)
router.patch('/customer/Update',checkUserStatus,requireAuth,DepreciationController.RetailCustomer_Udate)
router.delete('/customer/:customerId/routeDay',checkUserStatus,requireAuth,DepreciationController.DeleteDaysFromCustomerRoute)
router.delete('/remove_item',checkUserStatus,requireAuth,DepreciationController.DeleteOrderLineItem)
router.put('/cancel_invoice',checkUserStatus,requireAuth,DepreciationController.ReverseInvoice)
router.get('/van/Settings',checkUserStatus,requireAuth,DepreciationController.vanSettings)
router.patch('/Editvan',checkUserStatus,requireAuth,DepreciationController.Van_Update)
router.get('/Retail/customer',checkUserStatus,requireAuth,DepreciationController.ManagerCustomer)
router.get('/PaymentMethods',checkUserStatus,requireAuth,DepreciationController.VanpaymentCSV)
router.get('/Retail/invoice/pdf/:id',checkUserStatus,requireAuth,DepreciationController.DownloadInvoicePdf)
router.get('/CustomerList',checkUserStatus,requireAuth,DepreciationController.ManagerCustomerList)
router.post('/Paymentvan',checkUserStatus,requireAuth,CheckDriver,DepreciationController.updatePayment)
router.delete('/delete_order',checkUserStatus,requireAuth,CheckDriver,DepreciationController.deleteOrder)
router.get('/retailPayment',checkUserStatus,requireAuth,DepreciationController.SingleretailPay)
router.patch('/reverse/retailPayment',checkUserStatus,requireAuth,DepreciationController.retailPaymentReturn)
//404
router.get('/404',async (req, res, next)=>{
res.render('404')
})
module.exports = router;
