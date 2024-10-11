// submit form to table
const title = document.getElementById("title").value;
let submitBtn = document.getElementById("submitBtn");
const employeeId = document.getElementById("employeeId").value;


const Appraiasls = {
  StartDate:"",
  Period:"",
  ref: title,
  Employe: employeeId,
  Status:"Pending" ,
  kpi: [],
  MdComment: "",
  HrCommnet: "",
  ManagerComment: "",
  employeComment: "",
  generalRating: "",
};



const d = new Date();
const Start = document.getElementById("Start");
Start.addEventListener("change", (e) =>{Appraiasls.StartDate =  e.target.value});
const PeriodQ = document.getElementById("Period")
PeriodQ.addEventListener("change", (e) =>{Appraiasls.Period =  e.target.value});

const Perspectives = document.querySelector("#Perspectives")
Perspectives.addEventListener("change", (e) => {

  function kpi() {
    this.id = Math.floor(Math.random() * 108787675)
    this.Rating = 0;
    this.weight = 0;
    this.Manager_Score = 0;
    this.Perspective = e.target.value;
    this.Objectives = '';
    this.employeeScore = 0;
  }
  Appraiasls.kpi.push(new kpi());
  render(Appraiasls.kpi);
  e.target.value = ''
 console.log(Appraiasls)
});

submitBtn.addEventListener("click", async () => {
  try {
    if (Appraiasls.kpi.length < 1) {
      submitBtn.setAttribute("disabled", true);
      throw new Error("Please select a KPI for this employee, Reload page to disable submit button");
    } else {
       
      const request = await fetch("/api/v1/Appraiasl/Employee/Apraisal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Appraiasls),
      });
      const response = await request.json();
      response.message ? ShowServerResponse(response.message) : serverError(response.error)
      response.message ? location.reload() : "";
      
    }
  } catch (error) {
    serverError(error.message);
    submitBtn.setAttribute("disabled", true);
  }
});

var conNumber = 0;
const render = function (Apraisals) {
  var tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  Appraiasls.kpi.forEach((kpi) => {
    let trow = document.createElement("tr");
    // let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    let td3Inputed = document.createElement("textarea");
    let td4Inputed = document.createElement("input");
    let td4 = document.createElement("td");
    let td5 = document.createElement("td");
    let td6 = document.createElement("td");
    let td7 = document.createElement("td");

    // td1.innerText = conNumber + 1;
    td6.innerText = kpi.Perspective;
    // td4.innerText = kpi.employeeScore;
    // td5.innerText = kpi.Manager_Score
    td4Inputed.value = kpi.weight
    td7.innerText = String.fromCodePoint(10008);
    td3Inputed.value = kpi.Objectives


    // set mweight and  
    td4Inputed.addEventListener('change',(e) => {
      
      let index = Appraiasls.kpi.findIndex((item) => {
        return item === kpi;
      });
      if (index > -1) {
        try {
          kpi.weight = parseInt(e.target.value);
          render(Appraiasls.kpi);
        } catch (error) {
          serverError(error.message);
        }
      }
    })


    // update objective
    td3Inputed.addEventListener('change',(e) => {
      
      let index = Appraiasls.kpi.findIndex((item) => {
        return item === kpi;
      });
      if (index > -1) {
        try {
          kpi.Objectives = e.target.value;
          render(Appraiasls.kpi);
        } catch (error) {
          serverError(error.message);
        }
      }
    })

    // delete kpi
    const deleteItem = () => {
      let index = Appraiasls.kpi.findIndex((item) => {
        return item === kpi;
      });
      if (index > -1) {
        try {
          Appraiasls.kpi.splice(index, 1);
          render(Appraiasls.kpi);

          calculateMax(Appraiasls.kpi);

          ShowServerResponse("kpi removed successfully");
        } catch (error) {
          serverError(error.message);
        }
      }
    };

    //delete kpi innovation from list   of
    td7.onclick = deleteItem;
    td7.setAttribute("title", "click to delete");
    td7.classList.add("text-danger");
    td3Inputed.classList.add("form-control");
    td4Inputed.classList.add("form-control");
    td3Inputed.setAttribute("required", "true");
    td4Inputed.setAttribute("required", "true");
    td4Inputed.style.width = "100px";
    td4Inputed.setAttribute("type", "number");
    td2.style =
      {
        width: " 11em",
        backgroundColor: "lightblue",
        border: ` 2px solid black`,
        padding: "10px",
        wordWrap: "break-word",
        fontSize: "20px",
      };

      trow.appendChild(td6);
      trow.appendChild(td3);
      td3.appendChild(td3Inputed);
      td2.appendChild(td4Inputed);
    trow.appendChild(td2);
    // trow.appendChild(td5);
    // trow.appendChild(td4);
    trow.appendChild(td7);
    tbody.appendChild(trow);
  });
  calculateMax(Appraiasls.kpi);
};

// calculate Max score
const calculateMax = function (Apraisals) {
  var max = Appraiasls.kpi
    .map((kpi) => {
      return kpi.weight;
    })
    .reduce((total, currentValue) => {
      return parseInt(total) + parseInt(currentValue);
    }, 0);
  document.getElementById("Max").innerText = `Max Score: ${max}/100`;
  if (max > 100) {
    serverError("max score exceeded");
  }
  return max;
};

