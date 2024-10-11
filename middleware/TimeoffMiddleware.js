const Timeoff = require("../modules/Timeoff");
const Employe = require('../modules/Employees');
const { ObjectId } = require("mongodb");

const debtDays = (start, end) =>{
              
    // Convert to days
    
    const date1 = new Date(end);
    const date2 = new Date(start);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // console.log(diffTime + " milliseconds");
    // console.log(diffDays + " days");
    return parseInt(diffDays)
}


const deductLeaveDays = async (req,res,next)=>{
    try{
        await Timeoff.findById({_id:ObjectId(req.query.timeoffId)})
        .then(async(timeoff)=>{

        await Employe.findById(timeoff.EmployeeId).then((employee)=>{
            if(timeoff.Type === 'Annual Leave'){
            employee.AnualLeave =  employee.AnualLeave - debtDays(timeoff.EndDate,timeoff.StartDate) 
            employee.Notification.push({
                logMessg:`Congratulations, Your ${timeoff.Type} of ${debtDays(timeoff.EndDate,timeoff.StartDate)}days has been Approved. We hope you enjoy your break`,
                url:`/api/v1/TimeOFF/${timeoff._id}`,
                status:'Unseen'
            })
            employee.save()
            }else if(timeoff.Type === 'Sick Leave'){
            employee.SickLeave =  employee.SickLeave - debtDays(timeoff.EndDate,timeoff.StartDate) 
            employee.Notification.push({
                logMessg:`Congratulations, Your ${timeoff.Type} of ${debtDays(timeoff.EndDate,timeoff.StartDate)}days has been Approved. We hope you enjoy your break`,
                url:`/api/v1/TimeOFF/${timeoff._id}`,
                status:'Unseen'
            })
            employee.save()
            }else if(timeoff.Type === 'Study Leave'){
            employee.STudyLeave =  employee.STudyLeave - debtDays(timeoff.EndDate,timeoff.StartDate) 
            employee.Notification.push({
                logMessg:`Congratulations, Your ${timeoff.Type} of ${debtDays(timeoff.EndDate,timeoff.StartDate)}days has been Approved. We hope you enjoy your break`,
                url:`/api/v1/TimeOFF/${timeoff._id}`,
                status:'Unseen'
            })
            employee.save()
            }else if(timeoff.Type === 'Maternity Leave'){
            employee.MaternityLeave =  employee.MaternityLeave - debtDays(timeoff.EndDate,timeoff.StartDate) 
            employee.Notification.push({
                logMessg:`Congratulations, Your ${timeoff.Type} of ${debtDays(timeoff.EndDate,timeoff.StartDate)}days has been Approved. We hope you enjoy your break`,
                url:`/api/v1/TimeOFF/${timeoff._id}`,
                status:'Unseen'
            })
            employee.save()
            }
        })

        timeoff.status = 'HR Approve'
        timeoff.save()

        if(timeoff.category === 'Unpaid'){
            res.status(200).json({message:`Time Off status confirmed and notification sent`})
            }else{
            next()//payroll stuff
        }

        })

       
    }catch(error){
        res.status(500).json({error:error.message})
    }
}



module.exports = {deductLeaveDays}



