const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
let date = new Date()

// this function sends mail to ware house manager 
const LiveChatLink = async (data) => {
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
                    name: `${ERPSmtpName}`,
                    link : `https://${url}/`,
                    logo: '/images/logo.jpg',
                    copyright: `© ${date.getFullYear()} ${ERPSmtpName}.`,
                }
            })
        
            let response = {
                body: {
                name : `${data.name}`,
                intro: `Thank you for Contacting ${ERPSmtpName}.Our Customer service agent will respond to you shortly.`,
                action: [
                    {
                        instructions: `If you need further assistance,Chat with our customer service by Clicking the Button below`,
                        button: {
                            color: 'silver',
                            text: `Chat with a Support Person`,
                            link: `${url}/api/v1/Livechat/Link/${data._id}`
                        }
                    }
                ]
            },
                outro: "kind Regards"
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : data.email,//accountant email address
                subject: `${ERPSmtpName} Support ${data.TicketId}`,
                html: mail
            }
            
            transporter.sendMail(message).then((stau) => {
                console.log('Mail sent successfully')
            }).catch(error => {
                console.log( error )
            })
        
    
    
};

module.exports = LiveChatLink
