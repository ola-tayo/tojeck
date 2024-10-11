const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const Employee = require('../modules/Employees');
const Product = require('../modules/Product')


// this function sends mail to ware house manager 
const NotifyCFOPriceChange = async (req,res,next) => {
    const updatedproduct = await Product.findById(req.params.id)
    let date = new Date()
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
                    name : `CFO`,
                    intro: `Buying price updated.`,
                    greeting: 'Dear',
                    signature: 'Sincerely',
                    
                    table: [
                        {
                            // Optionally, add a title to each table.
                            title: `Buying price change on ${updatedproduct.Name} `,
                            data: [
                                {
                                    product:updatedproduct.Name,
                                    date:date,
                                    Newprice: `₦${req.body.updatedBuyingPrice}`,
                                }
                            ]
                        },
                    ],
                    action: [
                        {
                            instructions: `See updated product`,
                            button: {
                                color: 'silver',
                                text: 'View Product',
                                link: `${url}/api/v1/Product/${updatedproduct._id}/${updatedproduct.Name}`
                            }
                        }
                    ],
                    outro: `Regards, (${person.firstName})`
                }
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//cfo email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(async(status) => {
                console.log(status)
            }).catch(error => {
                console.log( error )
            })
        });
        res.status(200).json({message:`Buying price of ${updatedproduct.Name} has been updated Successfully`})
    })
    
};

module.exports = NotifyCFOPriceChange
