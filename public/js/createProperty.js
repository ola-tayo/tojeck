const PropreryForm = document.getElementById('PropreryForm')
PropreryForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const client  = await fetch('/api/v1/createProperty',{
        method: 'POST',
        body: JSON.stringify({
            Image:PropreryForm.image.value,
            Title:PropreryForm.Title.value,
            Address:PropreryForm.Address.value,
            Amount:PropreryForm.Amount.value,
            size:PropreryForm.size.value,
            room:PropreryForm.room.value,
            toilet:PropreryForm.toilet.value,
            kitchen:PropreryForm.kitchen.value,
            parking:PropreryForm.parking.value,

        }),
        headers: {'Content-Type': 'application/json'},
    })

    const server = await client.json()
    .then(response => {
        alert(response.message || response.error)
    })
})


