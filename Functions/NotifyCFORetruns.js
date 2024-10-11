const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const {WHouse} = require('../modules/warehouse');
const Employee = require('../modules/Employees');
const bills = require("../modules/Bills");
const {usernotification} = require('../warehouseValidation/warehouseValidate.js');


// this function sends mail to ware house manager 
const NotifyCFORetruns = async (req,res) => {
  try {
    const Bill = await bills.findById(req.body.BillId)

    let date = new Date()
   const WHous =  await WHouse.findById( req.body.WHId)//find bill 
   await Employee.find({$and: [
    { status: "active" },
    { isCFO:true}]})
    .then((CFO) => {
        CFO.forEach( person => {
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
        
            let transporter = nodemailer.createTransport(config);

            usernotification({ 
                Title:`Return Request from ${WHous.WHName} / ${req.body.storeKeeper} to Review.`,
                url:``,
                userId:person._id
            })
        
            let MailGenerator = new Mailgen({
                theme: "salted",
                product : {
                    name: 'BADE',
                    link : 'https://mailgen.js/',
                    logo: '',
                    copyright: `© ${date.getFullYear()} BADE.`,
                }
            })
        
            let response = {
                body: {
                    name : `CFO`,
                    intro: `New Return Request from ${WHous.WHName} / ${req.body.storeKeeper} to Review.`,
                    greeting: 'Dear',
                    signature: 'Sincerely',
                    
                    table: [
                        {
                            // Optionally, add a title to each table.
                            title: `Invoice Ref:${req.body.billReferenceNo} `,
                            data: [
                                {
                                    Date : req.body.ReturnDate,
                                    customer : Bill.customerName.toLowerCase(),
                                    "Grand Total": `₦${Bill.grandTotal}`,
                                }
                            ]
                        },
                    ],
                    action: [
                        {
                            instructions: ``,
                            button: {
                                color: '#22BC66',
                                text: 'View Request',
                                // link: `${url}/api/v1/${result._id}/Returns`
                            }
                        }
                    ],
                    outro: `Thanks for your speedy response (${person.firstName})`
                }
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//cfo email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(async() => {
               //c
               console.log("Sent mail")
            }).catch(error => {
                throw new Error(error.message)
            })
        });
    })
    res.status(200).json({message:'CFO has been Notified'})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
    
};

module.exports = NotifyCFORetruns
