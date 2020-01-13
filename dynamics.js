
            const async = require('async'),
            path = require('path'),
            mongoose = require('mongoose'),
            moment=require('moment')
            JWT = require(path.resolve('./app/config/libs/jwt')),
            BuyerAuth = require(path.resolve('./app/config/libs/BuyerAuth')),
            wrapper = require(path.resolve("./app/config/libs/wrapData")),
            Pagination = require(path.resolve('./app/config/libs/paginate')),
            config = require(path.resolve(`./app/config/env/${process.env.NODE_ENV}`)),
            Property = require(path.resolve('./app/models/property_detail')),
            PropertyCms = require(path.resolve('./app/models/property')),
            BuyPropertyCMS = require(path.resolve('./app/models/buy_property_page')),
            RecContact = require(path.resolve('./app/models/recContact')).recContact,
            Agent = require(path.resolve('./app/models/agent')),
            Crm_logs = require(path.resolve('./app/models/crmlog')),
            User = require(path.resolve('./app/models/webusers')),
            DynamicsWebApi = require('dynamics-web-api'),
            AuthenticationContext = require('adal-node').AuthenticationContext,
            needle = require('needle'),
            Mailer = require(path.resolve('./app/config/libs/mailer')),
            InvestorLift = require(path.resolve('./app/config/libs/investorlift/investorlift')),
            InvestorLiftMapper = require(path.resolve('./app/config/libs/investorlift/mapper'));

            module.exports=class CrmsyncController {

            // constructor(){

            // }

            
            /**
            * Property Cms
            * @param {Object} req [Requested parameter]
            * @param {Object} res [Response]
            * @return {Object} [Property detail object]
            */
            prpertyCms(req, res,next) {
            PropertyCms.find({
            "status": true
            }, (err, result) => {
            if (err) {
            res.json(
            wrapper.error({
            message: err
            })
            );
            } else {
            res.json(wrapper.success({
            result
            }));
            }
            });
            }
            /**
            * Contact rec form
            * required params url
            * @static
            * @param {any} req
            * @param {any} res
            * @param {any} next
            * @memberof Buyers
            */
    static test(req, res) {
            // var resource = config.dynamics.resource;
            // var dynamicsWebApi = new DynamicsWebApi({
            // webApiUrl: resource + '/api/data/v8.2/',
            // onTokenRefresh: getToken,
            // rejectUnauthorized:false
            // });



            //perform a multiple records retrieve operation
    dynamicsWebApi.retrieveAll("emn_Agents", ["emn_email","emn_firstname","emn_lastname","createdon",
    "emn_mobilephone"],).then( async function (response) {

    try{

       let today = moment(new Date())
    //    let data=[]
       let data=response.value
           data=response.value.filter((crm)=>{
             let  crmdate=moment(crm.createdon)
             let  diffDays=today.diff(crmdate, 'day');
                if(diffDays<=0){
                return crm
                // console.log("thisi si crm",crm)
               }
          })
     
        
        let allProm = [];
        let logCount = 0;
        data.forEach(result => {
             let crmObj={}
             crmObj['user_type']=3
            
             crmObj['crmuser']="crmusers"
             crmObj['source']="manual"
             if(result.emn_firstname){
                 crmObj['firstname']=result.emn_firstname
                    }
                    if(result.emn_lastname){
                        crmObj['lastname']=result.emn_lastname
                    }
                    if(result.emn_email){
                        crmObj['email']=result.emn_email
                   
                        
                    }
                    if(result.emn_mobilephone){
                        crmObj['mobile']=result.emn_mobilephone
                        crmObj['communication']=1
                        }
    
                    else{
                        crmObj['communication']=2
                    
                        }
              allProm.push(
              crmSave(crmObj, () => {
                  logCount++;
              })
            );
        //   res.json({data:data})
        })
        await Promise.all(allProm);
        let date = moment().format("YYYY MM DD");
        const crmlog = new Crm_logs({
                    date:date,
                    Number_of_Agent_from_Crm:logCount
             })
    
        crmlog.save();
        res.json({ code: 200, data: data });
        return;

  }

  catch(error){
  console.log(error)
  } 


// save crm value in database

  async function crmSave(data, logUpdater) {
    console.log("yief",data)
    let allPrmoise = [];
    console.log("this is data email",data.email)
  
    let user = await User.findOne({ email: data.email });
     
    console.log("email is already exist",user)
    if (user && !user.firstname) {
      let prom1 = User.findOneAndUpdate(
        { email: data.email,source:'manual' },
        { $set: { firstname: data.firstname } }
      );

      allPrmoise.push(prom1);
    }
    if (user && !user.lastname) {
      let prom2 = User.findOneAndUpdate(
        { email: data.email,source:'manual' },
        { $set: { lastname: data.lastname } }
      );
    //   logUpdater();
      allPrmoise.push(prom2);
    } 
    if (user && !user.mobile) {
        let prom3 = User.findOneAndUpdate(
          { email: data.email,source:'manual' },
          { $set: { mobile: data.mobile, } }
        );
        allPrmoise.push(prom3);
      }

    else if(user){
    console.log("email is already exist");
    } 
  
    else {
      
      let user = new User(data);
      let prom4 = user.save();
      logUpdater();
      allPrmoise.push(prom4);
    }
    return Promise.all(allPrmoise);
  }
  
})
}





//   *************************Mongo to Crm send data ******* ******************

   static mongotoCrm(req,res){
    // var resource = config.dynamics.resource;
    // var dynamicsWebApi = new DynamicsWebApi({
    // webApiUrl: resource + '/api/data/v8.2/',
    // onTokenRefresh: getToken,
    // rejectUnauthorized:false
    // });
    try{

      // var date = new Date();
      // // date = date.setDate(date.getDate() - 1);
      // date = date.setHours(0,0,0,0);
      // date =  date + 14391528;
      // console.log('date is ',  date);

     User.find({crmuser:{ $exists: false}}).then(async function(response) {
     
      // console.log("my data is  here",response)
    //  let today = moment(new Date())
      let data=response
    //       data= response.filter((user)=>{
    //    let  mongodate=moment(user.created_at)
    //      let  diffDays=today.diff(mongodate, 'day');
    //              if(diffDays<=0){
    //                return user
                  
    //               }
        
    //             })
                  let allUser= [];
                  // let logCount = 0;
                let mongodata= data.map(result => {
                       let mongoObj={}
                       if(result.firstname){
                           mongoObj['emn_firstname']=result.firstname
                              }
                              if(result.lastname){
                                  mongoObj['emn_lastname']=result.lastname
                              }
                              if(result.email){
                                  mongoObj['emn_email']=result.email
                                }
                              if(result.mobile){
                                  mongoObj['emn_mobilephone']=result.mobile
                                
                                  }
                                  console.log("my result",result)
                                  // return mongoObj
                       allUser.push(webuserSave(mongoObj))
                        
                  
                          })
                    
                            await Promise.all(allUser).then((values)=>{
                              
                              res.json({'my data is here':values})
                            })
                //  console.log(data)
         })
       
}
    catch(error){
       console.log(error)
    }

     async function webuserSave(data) {
     console.log("data is ",data)
    
     var request = {
      collection: "emn_Agents",
      select: ["emn_firstname", "emn_lastname","emn_mobilephone","emn_email"],
      filter: "emn_email eq  '" + data.emn_email + "' ",
      // maxPageSize: 5				//just for an example
  };
  //  console.log(da)
 console.log("phone",data.emn_mobilephone)
  let response = await dynamicsWebApi.retrieveAllRequest(request)
   
    
   console.log("values are ",response.value)
  
// //initialize a CRM entity record object
// //and specify fields with values that need to be updated

       
       if(response && !response['value'].emn_lastname){
         
         let agentId=''
           agentId=response['value'][0].emn_agentid
             let crmObj1={
           emn_lastname:data.emn_lastname
       }
      
         console.log("my crmobj",crmObj1)
        

        dynamicsWebApi.update(agentId ,"emn_Agents",crmObj1).then(function (id) {
          console.log('update crm id', id);
          id = id;
          console.log("after update", response.value)
          // res.json(wrapper.success({result}));
      }).catch(function (error) {
          console.log("error----------", error)
          // cb(error, null);
      })
      .catch(function (error){
        console.log("eror",error)
      });
       }
  
 
  // console.log("there is a record".records)
 
      // let allPrmoise=[]
  // let user =   dynamicsWebApi.create(data, "emn_Agents").then(function (response) {
          // /allPrmoise.push(user)
        //  return Promise.all(data);
      // })
//   })
//   .catch(function (error) {
//     console.log("this ")
// })
  }
}
   }










 //add a callback as a parameter for your function
   function getToken(dynamicsWebApiCallback) {
    var authorityUrl = config.dynamics.authorityUrl;
    var resource = config.dynamics.resource;
    var clientId = config.dynamics.clientId;
    var clientSecret = config.dynamics.clientSecret;
    var adalContext = new AuthenticationContext(authorityUrl);
    //a callback for adal-node
    function adalCallback(error, token) {
    if (!error) {
    //call DynamicsWebApi callback only when a token has been retrieved
    console.log(dynamicsWebApiCallback(token));
    } else {
    console.log('Token has not been retrieved. Error: ' + error.stack);
    }
    }
    //call a necessary function in adal-node object to get a token
    // adalContext.acquireTokenWithUsernamePassword(resource, username, password, clientId, adalCallback);
    adalContext.acquireTokenWithClientCredentials(resource, clientId, clientSecret, adalCallback);
    

}





























        // My old code 
        
        // let today = moment(new Date())
        // let data=[]
        

        //   data=response.value.filter((crm)=>{
        //      let  crmdate=moment(crm.createdon)
        //      let  diffDays=today.diff(crmdate, 'day');
        //         if(diffDays<=0){
        //         return crm
        //        }
        //   })

        // console.log(data)
        // res.json({data:data})
            
            
        //     let crm_data=data.map((result)=>{
            
        //         let crmObj={}
        //         if(result.emn_firstname){
        //             crmObj['firstname']=result.emn_firstname
        //         }
        //         if(result.emn_lastname){
        //             crmObj['lastname']=result.emn_lastname
        //         }
        //         if(result.emn_email){
        //             crmObj['email']=result.emn_email
        //             crmObj['source']="manual"
                    
        //         }
        //         if(result.emn_mobilephone){
        //             crmObj['mobile']=result.emn_mobilephone
        //             crmObj['communication']=1
        //             }

        //         else{
        //             crmObj['communication']=2
                
        //             }
            
        //     return crmObj
        //     })
        //     console.log("this is my object",crm_data)

        //     let req=[];
        //     for (var i=0;i<crm_data.length;i++){
        //      req.push(checkCrmObject(crm_data[i]))
            
        //     }
        //     return Promise.all(req);
           
                
            // .catch(function (error){
            // console.log('error', error)
            // //catch an error
            // });
            // console.log('test');
        

            

         














            // async function checkCrmObject(data){
                
            //     if(data.email){
                    
            //        let user = await User.findOne({email:data.email});
            //        if(user && user.mobile==null && !user.mobile){
            //             console.log('updated',data.mobile)
            //             let updateData = await User.findOneAndUpdate
            //             ({email:data.email,source:'manual'},
            //             {$set:{mobile:data.mobile}})
            //         }
            //         if(user && user.firstname==null && !user.firstname){
            //             console.log('updated',data.firstname)
            //             let updateData = await User.findOneAndUpdate
            //             ({email:data.email,source:'manual'},
            //             {$set:{firstname:data.firstname}})
            //         }
            //         if(user && user.lastname==null && !user.lastname){
            //             console.log('updated',data.lastname)
            //             let updateData = await User.findOneAndUpdate
            //             ({email:data.email,source:'manual'},
            //             {$set:{lastname:data.lastname}})
            //         }
                    
                        
            //       else if(user){
            //             console.log("email is already exist")
            //             //   let user = await User.findOne({email:data.email,source:'manual',trash:false});
            //         }
            
            //         else{
            //             console.log('save')
                        
            //             let user= new User(data);
            //             console.log("they are my data",user)
            //              let saveData = await user.save();
                            
            //              datacount=[]
            //              datacount.push(saveData)
            //              for(let i=0;i<datacount.length;i++){
            //                  Crmlog(datacount.length)
            //              }
                            
                            
    
            
            //             // console.log("thi is my crm lenght",datacount.length)
            //             // Crmlog(count)
            //             console.log('check all data',saveData)
                
            //         }
                    
            // }
            // }

        //  function Crmlog(agentcount){      
        //  let today=moment(new Date()).format('YYYY/ MM/ DD');
        //     const crmlog = new Crm_logs({
        //         date:today,
        //         Number_of_Agent_from_Crm:agentcount
        //     })

        //     let saveData =  crmlog.save();
        //     console.log('this is my logs count data ',saveData)
        // }

            // convert to whole coming crm data from object to single field 

           



