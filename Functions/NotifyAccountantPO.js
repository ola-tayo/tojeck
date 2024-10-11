const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const {WHouse} = require('../modules/warehouse');
const Employees = require('../modules/Employees')
const {usernotification} = require('../warehouseValidation/warehouseValidate.js');


// this function sends mail to ware house manager 
const NotifyAccountantP0 = async (purchased) => {
 try{
  
    const wareHous = await WHouse.findById(purchased.WHID)
   let date = new Date()
   await Employees.find({$and: [
    { status: "active" },
    { isAccountant:true}]})
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
        
            let transporter = nodemailer.createTransport(config);

             //push notifications to user
             usernotification({ 
                Title:`New Purchase for your review GRN/${purchased.billReferenceNo}`,
                url:`/api/v1/Purchase/bill/${purchased._id}`,
                userId:person._id
            })
        
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
                intro: `New Purchase Order for ${wareHous.WHName} to review`,
                action: [
                    {
                        instructions: `Please ensure to put a follow up call with ${wareHous.WHName} Invoicer if need be.`,
                        button: {
                            color: '#22BC66',
                            text: `See  GRN/${purchased.billReferenceNo}`,
                            link: `${url}/api/v1/Purchase/bill/${purchased._id}`
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
               
            }).catch(error => {
                throw new Error(error.message);
            })
        });
    })
    
 }catch(err){
    console.log(err.message);
 }
};

module.exports = NotifyAccountantP0
