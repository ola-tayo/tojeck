const chatForm = document.getElementById('chatForm')
const chatIds= document.getElementById('chatId')
const sender = document.getElementById('sender')
// let serverResponse


setInterval(async()=>{

    const chatId = chatIds.dataset.chatid
    const client = await fetch(`/api/v1/livechat/updates/${chatId}`,{
        method:'GET',
        headers: {'Content-Type': 'application/json'},
    })
    const serverResponse = await client.json()
    // console.log(serverResponse.status)
    UpdateDom(serverResponse.response)
    

},1000)



chatForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const senderId = sender.dataset.senderid
    const chatId = chatIds.dataset.chatid
    const mssg = {
                messageBody:chatForm.message.value,
                senderId:senderId,
                time:moment().format('l'),
                author:chatForm.author.value
            }

    var json = JSON.stringify(mssg);

    var xhr = new XMLHttpRequest();
xhr.open("PUT", `/api/v1/chat/${chatId}`, true);
xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
xhr.onload = function () {
    var SeverResponse = JSON.parse(xhr.responseText);
    if (xhr.readyState == 4 && xhr.status == "200") {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: "Message sent"
        });
        chatForm.reset();
        chatForm.message.focus();
        renderDom(SeverResponse);
    } else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: SeverResponse.error
          });
    }
}
xhr.send(json);

})


// render updated Dom

const renderDom = (array)=>{
    const display = document.getElementById('display')
    display.innerHTML = ''
    array.conversation.forEach(element => {
        
        let div = document.createElement('div');
        let p = document.createElement('p');
        let span = document.createElement('span');

        // // assign properties
        if(element.senderId.toString() === ''){
            div.classList.add('bg-warning-subtle');
        }

        div.classList.add('chatContainer');
        div.classList.add('shadow-sm');
        span.classList.add('time-left');


        p.innerText = element.messageBody;
        span.innerText = element.senderId === '' ? `${element.author} ${element.Timestamp}` : `Support ${element.Timestamp}` ;

        div.appendChild(p);
        div.appendChild(span);
        display.append(div)

    });
  
}


const UpdateDom = (serverResponse)=>{

    const chatId = chatIds.dataset.chatid
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            renderDom( serverResponse)
        }
    };
    xhttp.open("GET", `/api/v1/livechat/updates/${chatId}`, true);
    xhttp.send();
  
}