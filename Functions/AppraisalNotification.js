const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const Employee = require('../modules/Employees');
const Appraisal = require('../modules/Appraisal');
const {usernotification} = require('../warehouseValidation/warehouseValidate.js');


// this function sends mail to ware house manager 
const AppraisalNotify = async (data) => {
    const appraisal = await Appraisal.findById(data._id)
    let date = new Date()
   await Employee.findById(data.Employe)
    .then((person) => {
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
                Title:`${data.kpi.length} KPI set on ${data.ref} `,
                url:`/api/v1/${data._id}/Appraisal/`,
                userId:person._id
            })
        
            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "salted",
                product : {
                    name: 'BADE',
                    link : 'https://mailgen.js/',
                    logo: '/logo.jpg',
                    copyright: `© ${date.getFullYear()} BADE.`,
                }
            })
        
            let response = {
                body: {
                    name : `${person.firstName} ${person.lastName}`,
                    intro: `Review and Accept Appraisal [KPI] for this Quarter.`,
                    greeting: 'Dear',
                    signature: 'Sincerely',
                    
                    table: [
                        {
                            // Optionally, add a title to each table.
                            title: `${data.kpi.length} KPI set on ${data.ref} `,
                            data: data.kpi.map((kpi) =>{
                                return {
                                    Perspective : kpi.Perspective,
                                    Objectives : kpi.Objectives,
                                    Measures: kpi.weight
                                }
                            })
                        },
                    ],
                    action: [
                        {
                            instructions: `By clicking on the button bellow, you will Accept the set KPI for the period specified`,
                            button: {
                                color: 'green',
                                text: 'Accept Set KPI',
                                link: `${url}/api/v1/${data._id}/Appraisal/`
                            }
                        }
                    ],
                    outro: `Kind Regards, ${person.firstName}.`
                }
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//appraisee
                subject: `Invite to ${data.ref} Appraisal`,
                html: mail
            }
            
            transporter.sendMail(message).then(async(message) => {
               console.log(message)
            }).catch(error => {
                console.log( error )
            })
       
    })
    
};

module.exports = AppraisalNotify
