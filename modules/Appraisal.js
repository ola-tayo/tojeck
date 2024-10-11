const mongoose = require('mongoose')

var kpi = new mongoose.Schema ( {  
  Rating : Number, 
  weight : Number ,
  Manager_Score: Number ,
  Perspective: String ,
  Objectives: String ,
  employeeScore:Number ,
});  
  
var Appraisal = new mongoose.Schema ( {  
  Employe:{
      type: mongoose.Types.ObjectId ,
      required: true
    }, 
    Period:String,
    ref : String  , 
    StartDate : String  , 
    kpi : [kpi]  ,
    MdComment :String , 
    HrCommnet :String ,
    ManagerComment :String ,
    employeComment :String ,
    generalRating :String ,
    status:{
      type:String,
      default:"pending",
    },
  },{timestamps:true},);  
  
 const Appraisals = mongoose.model ('Appraisal', Appraisal);

 module.exports = Appraisals;