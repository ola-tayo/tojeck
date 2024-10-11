const nodemailer = require("nodemailer");
const NewsLettre = require('../EmailTemplates/NewsLettre');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const Employe = require('../modules/Employees')
const business = require('../modules/company')


const SendMessages = async (data) => {
    const Business = await business.findOne()
  
    data.RecieptiantsEmails.forEach((Reciever)=>{

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
    
    let message = {
        from : EMAIL,
        to : Reciever.email,
        subject: `${ERPSmtpName} ${data.title} `,
        html: NewsLettre(data,url,Business)
    }
    
    transporter.sendMail(message).then(() => {
       console.log('mail sent successfully')
    }).catch(error => {
        console.log(error.message)
    })
    
})

   
};

module.exports = SendMessages
