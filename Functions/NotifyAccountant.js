const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const Employee = require('../modules/Employees');
const Bills = require('../modules/Bills');
const {usernotification} = require('../warehouseValidation/warehouseValidate.js');


// 
const NotifyAccountant = async (req,res,next) => {
   try {
    const bill =  await Bills.findOne({billReferenceNo:req.body.billReferenceNo}).limit(1)//find bill 
   let date = new Date()
   await Employee.find({$and: [
    { status: "active" },
    { notifySalesOrder:true}]})
    .then((Accontant) => {
        Accontant.forEach( person => {
            let config = {
                host:EMAIL,
                service : 'gmail',
                secure:true,
                port : 465,
                auth : {
                    user: EMAIL,
                    pass: PASSWORD
                },
                tls : { rejectUnauthorized: false }//always add this to stop error in console   
            }
        
             //push notifications to user
             usernotification({ 
                Title:`New Sales order Raised for ${req.body.customerName}  with REF NO ${req.body.billReferenceNo}/${req.body.invoicelocation}`,
                url:`/api/v1/bill/${bill._id}`,
                userId:person._id
            })

            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "salted",
                product : {
                    name: 'BADE',
                    link : 'https://mailgen.js/',
                    logo: 'bade.jpg',
                    copyright: `© ${date.getFullYear()} BADE.`,
                }
            })
        
            let response = {
                body: {
                name : `Accountant ${person.firstName}`,
                intro: `New Sales order Raised for ${req.body.customerName}  with REF NO ${req.body.billReferenceNo}/${req.body.invoicelocation}`,
                action: [
                    {
                        instructions: ``,
                        button: {
                            color: '#22BC66',
                            text: `ORDER/${req.body.billReferenceNo}/${req.body.invoicelocation}`,
                            link: `${url}/api/v1/bill/${bill._id}`
                        }
                    }
                ]
            },
                outro: "kind Regards"
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//accountant email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(() => {
                // res.status(200).json({
                //     message: `New Bill successfully Registered. Inventory adjusted, product has been removed from warehouse.`,
                //   });
            }).catch(error => {
                throw new Error(error.message);
            })
        });
    })
    res.status(200).json({
        message: `New Bill successfully Registered. Inventory adjusted, product has been removed from warehouse.`,
      });
    
   } catch (error) {
    res.status(500).json({
       error:error.message,
      });
   }
};

module.exports = NotifyAccountant
