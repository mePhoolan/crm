const crypto = require("crypto"),
  path = require("path"),
  mongoose = require("mongoose"),
  CronJob = require("cron").CronJob,
  Setting = require(path.resolve("./app/models/settings")),
  CrmsyncController = require(path.resolve(
    "./app/controllers/User/CrmsyncController"
  ));

class userController {
  // newtime = ''
  constructor() {}

  async addEditMetaData(req, res) {
  
    try {
     
      let reqData = req.body,
if(reqData.cronjob_time){
  reqData.cronjob_updated_at=new Date()
  setTimeout(() => {
    let newtime=""
    let datatime = reqData.cronjob_time.split(
      ":"
    );

    let hours = datatime[0];
    let oldminutes = datatime[1].split(" ");
    let minutes = oldminutes[0];
    let pm_format = oldminutes[1];
    // console.log("pm format is", pm_format)
    if (pm_format == "PM") {
      let newhours = parseInt(hours);
      let newpm_hours = newhours + 12;
      newtime = "" + minutes + " " + newpm_hours + " * * * ";
      console.log("new pm time ", newtime);
      userController.crmCron(newtime);
    } else {
      newtime = "" + minutes + " " + hours + " * * * ";
      userController.crmCron(newtime);
      console.log("new pm time ", newtime);
    }
    // newtime = '' + minutes + ' ' + hours + ' * * * '

    // console.log("newtime asrics", newtime)
    // console.log("they are  hours", hours)
    // console.log("they are  minutes", minutes)
    // console.log(process.env.NODE_ENV)
  }, 1000);
}
      match = { meta_key: reqData.meta_key };
      Setting.findOneAndUpdate(
        match,
        reqData,
        { upsert: true },
        (err, result) => {
          if (err)
            return res.status(412).json({
              type: "error",
              message: "Error while add Ips",
              errors: [err]
            });
          else console.log("this is data result", result);
          Setting.aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }]).then(
            response => {
              // let lastlogtime = response[0]['date']
              
              res.json({ success: true, message: "Updated Successfully" });
            }
          );
        }
      );
    } catch {
      console.log(err);
    }
  }


  async getcrontime(req,res){
try {
Setting.findOne({meta_key:"Web_seting"}).then((response)=>{

      let crondate=response['cronjob_updated_at']
      if(crondate==false){
        return res.json({show_time:true})
      }
      let today = moment();

  
      let time = today.diff(crondate, "hours"); // 14
      if (time < 24) {
        res.json({
          show_time: false
        });
      } else {
        res.json({
          show_time: true
        });
      }
})
} catch (error) {
  
}
   }
  // cronjob_time
  // cronjob_updated_at

  getMetaData(req, res) {
    let reqData = req.query,
      match = { meta_key: reqData.meta_key };
    Setting.findOne(match)
      .then(result => {
        let today = moment();
        let lastUpdatedAt = result.cronUpdateTime;
        let time = today.diff(lastUpdatedAt, "hours"); // 14
        if (time < 24) {
          res.json({
            show_time: false
          });
        } else {
          res.json({
            show_time: true
          });
        }
        res.json({
          success: true,
          data: result,
          message: `${reqData.type} found`
        });
      })

      .catch(err =>
        res.status(412).json({
          type: "error",
          message: `Error while finding ${reqData.type}`,
          errors: [err]
        })
      );
  }
  
   static handleChnageInCronTime(req, res) {
    let reqData = req.query,
      match = { meta_key: reqData.meta_key };
    Setting.findOne(match)
      .then(result => {
        let today = moment( moment().format('LT') ,'LT')
        let lastUpdatedAt = moment(result.cronTime,'LT')
        let time = today.diff(lastUpdatedAt, "minutes"); // 14
        if (time < 2) {
            return true
        } else {
          return false
        }
      })
      .catch(err =>
        consoloe.log(err)
      );
  }


// static savecron(){
// var cronset=new Setting({
//   crontime:
// })
// }


  static crmCron = newtime => {
    if (process.env.NODE_ENV === "live") {
      var job = new CronJob({
        cronTime: newtime,
        onTick: function() {
          let shouldStart=this.handleChnageInCronTime();
          if(shouldStart){
             CrmsyncController.mongotoCrm(() => {
                setTimeout(() => {
                  CrmsyncController.crmtoMongo();
                }, 5000);
             });
          } 
         
        },
        start: false,
        utcOffset: -5
      });
      console.log("thi is last log time dskhf", job.cronTime);
      job.start();
      // }
    }
  };
}
var newtime = new userController();
module.exports = userController;
