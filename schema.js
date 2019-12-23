let mongoose=require('mongoose')

let crmSchema=mongoose.Schema({

   id:{
        type:String
    },
    email:{
        type:String
    },
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
},
    {
    timestamp:true
})
let crmuser=mongoose.model('crmuser',crmSchema)
module.exports=crmuser
