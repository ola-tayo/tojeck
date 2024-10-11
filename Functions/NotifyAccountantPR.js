const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const {WHouse} = require('../modules/warehouse');
const Employees = require('../modules/Employees')


// this function sends mail to ware house manager 
const NotifyAccountantPR = async (req,res) => {
    try {
            
    const wareHous = await WHouse.findById(req.body.WHID)
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
                 intro: `New Purchase Request from ${wareHous.WHName} to review`,
                 action: [
                     {
                         instructions: `Please ensure to put a follow up call with ${wareHous.WHName} Manager if need be.`,
                         button: {
                             color: '#22BC66',
                             text: `See P/R ${req.body.billReferenceNo}`,
                             link: `/api/v1/`
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
                throw new Error(error.message)
             })
         });
     })
     res.status(200).json({message:'Request has been Submited to Accountant successfully'})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
    
};

module.exports = NotifyAccountantPR
