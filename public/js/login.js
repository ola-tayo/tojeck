const login = document.getElementById('login')
login.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const client  = await fetch('/api/v1/login',{
        method: 'POST',
        body: JSON.stringify({Email:login.email.value,Password:login.pswd.value}),
        headers: {'Content-Type': 'application/json'},
    })

    const server = await client.json()
    .then(response => {
        response.serverError ?  ShowServerResponse(response.serverError) : ''
        if(response.Newcustomer) 
        {
            ShowServerResponse('Login Successful')
            location.assign('/api/v1/properties')
        }
    })
})


