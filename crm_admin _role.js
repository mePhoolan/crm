 getAdminRole(req,res){
        try {
            let  adminrole;
            let adminarray=[]
           Admin.find({},(err,result)=>{
               if(err){
               return res.status(412).json({ type: "error", message: "Unable to fecth admin role" });
               }
               else{
                   let adminRoles=[]
                   let adminarray=[]
                   adminRoles=result
                  let data=adminRoles.map((user=>{
                    // console.log("user are here",user)
                      adminrole=user.role.title
                      adminarray.push(user.role.title)
                     
                     console.log(adminrole)
                   }))
                  console.log("thes are my role",adminarray)
                return res.json({ status:true, message: "All Admin role here",roles:adminarray});
               }
           })
            
        } catch (error) {
            console.log("error is here")
            
        }
   

    }
