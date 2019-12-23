let  mongoose=require('mongoose')
mongoose.connect("mongodb://localhost:27017/Crm", { useNewUrlParser: true }, function (err, db) {
   
     if(err) throw err;
console.log("mongodb is connecteds")
     //Write databse Insert/Update/Query code here..
                
});
