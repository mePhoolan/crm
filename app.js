require('./DB')
let crmUser=require('./schema')
let express=require('express')
const fetch = require('node-fetch');
const _=require('lodash')
let app=express()
app.get('/data',async(req,res)=>{
    try {
        fetch('http://5ddcff9ff40ae700141e8b53.mockapi.io/crm')
        .then(res => res.json())
        .then(json => {
            
            

let my_data=[
    {"emn_agentid":"1","emn_email":null,"emn_firstname":"Keara","emn_lastname":"Lynch"},
    {"emn_agentid":"2","emn_email":"Vincenzo5@gmail.com","emn_firstname":"Olen","emn_lastname":"Bogan"},
    {"emn_agentid":"3","emn_email":null,"emn_firstname":"Reilly","emn_lastname":"Johnston"},
    {"emn_agentid":"4","emn_email":"Maximillian_Farrell@hotmail.com","emn_firstname":"","emn_lastname":"Gleichner"},
    {"emn_agentid":"5","emn_email":"Loren_Mayert@hotmail.com","emn_firstname":"Moses","emn_lastname":"Cassin"},
    {"emn_agentid":"6","emn_email":"Joseph.Gaylord@hotmail.com","emn_firstname":"Laron","emn_lastname":""},
    {"emn_agentid":"6","emn_email":"test@test.com","emn_firstname":"Laron","emn_lastname":""}
    ]

// for(let i=0;i<=my_data.length-1;i++){
//     console.log(my_data[i].emn_email)
// }
let email_array=[]
for(let i=0;i<my_data.length;i++){
   email_array.push(my_data[i].emn_email)
//  console.log(my_data[i].emn_email)
}

email_array=_.uniq(email_array)
let got_email=[]
crmUser.find({email:email_array},(error,data)=>{
    // console.log(data)
    data.forEach((doc)=>{
        // console.log(doc)
        got_email.push(doc.email)
    })
    got_email=_.uniq(got_email)
})


console.log("Got email",got_email)

let data_prom=my_data.map((result)=>{
    let obj={}
    if(result.emn_email && !got_email.includes(result.emn_email)){
        obj['email']=result.emn_email
    }
    if(result.emn_firstname){
        obj['firstname']=result.emn_firstname
    }
    if(result.emn_lastname){
        obj['lastname']=result.emn_lastname
    }
    const crm=new crmUser(obj)

    return crm.save() 
})

Promise.all(data_prom).then((data)=>{
    res.json({message:data})   
}).catch((error)=>{
    res.json({message:error})   
})
return
    

        const save_prom =json.map((doc)=>{
                const crm=new crmUser({
                    email:doc.emn_email,
                    firstname:doc.emn_firstname,
                    lastname:doc.emn_lastname
                })

                return crm.save()  
        })

            console.log(save_prom)

            Promise.all(save_prom).then((data)=>{
                res.json({message:data})   
            }).catch((error)=>{
                res.json({message:"Error"})   
            })

        })
    } catch (error) {
        
    }
    // console.log(data)
})
app.listen(3000,function(err,message){
    if(err) throw err;
    console.log("app is running at port 3000")
})


let my_data=[
{"emn_agentid":"1","emn_email":"","emn_firstname":"Keara","emn_lastname":"Lynch"},
{"emn_agentid":"2","emn_email":"Vincenzo5@gmail.com","emn_firstname":"Olen","emn_lastname":"Bogan"},
{"emn_agentid":"3","emn_email":"","emn_firstname":"Reilly","emn_lastname":"Johnston"},
{"emn_agentid":"4","emn_email":"Maximillian_Farrell@hotmail.com","emn_firstname":"","emn_lastname":"Gleichner"},
{"emn_agentid":"5","emn_email":"Loren_Mayert@hotmail.com","emn_firstname":"Moses","emn_lastname":"Cassin"},
{"emn_agentid":"6","emn_email":"Joseph.Gaylord@hotmail.com","emn_firstname":"Laron","emn_lastname":""}
]
