
app.get("/data", async (req, res) => {
  try {
    let response = await fetch(
      "http://5ddcff9ff40ae700141e8b53.mockapi.io/crm"
    );
    let data = await response.json();
    console.time("Adarsh");
    let allProm = [];
    let logCount = 0;
    data.forEach(result => {
      if (result.emn_email && result.emn_firstname && result.emn_lastname) {
        let obj = {};
        obj["email"] = result.emn_email;
        obj["firstname"] = result.emn_firstname;
        obj["lastname"] = result.emn_lastname;
        allProm.push(
          crmSave(obj, () => {
            logCount++;
          })
        );
      }
    });
    await Promise.all(allProm);
    let date = moment().format("YYYY MM DD");
    let logs = new Logs({
      logs_date: date,
      Number_of_Agent: logCount
    });
    logs.save();
    console.timeEnd("Adarsh");
    res.json({ code: 200, data: data });
    return;
  } catch (error) {
    console.log(error);
  }
});

async function crmSave(data, logUpdater) {
  let allPrmoise = [];

  let user = await User.findOne({ email: data.email });

  if (user && !user.firstname) {
    let prom1 = User.findOneAndUpdate(
      { email: data.email },
      { $set: { firstname: data.firstname } }
    );
    logUpdater();
    allPrmoise.push(prom1);
  }
  if (user && !user.lastname) {
    let prom2 = User.findOneAndUpdate(
      { email: data.email },
      { $set: { lastname: data.lastname } }
    );
    logUpdater();
    allPrmoise.push(prom2);
  } else if (user) {
    // console.log("email is already exist");
  } else {
    let user = new User(data);
    let prom3 = user.save();
    logUpdater();
    allPrmoise.push(prom3);
  }
  return Promise.all(allPrmoise);
}



// *******************************************
//      PHOOLAN CODE WITHOUNT CODE
// *******************************************

// app.get("/data", async (req, res) => {
//   try {
//     let response = await fetch(
//       "http://5ddcff9ff40ae700141e8b53.mockapi.io/crm"
//     );
//     let data = await response.json();
//     console.time("PhoolanAdarsh");
//     let data_prom = data.map(result => {
//       let obj = {};
//       if (result.emn_email) {
//         obj["email"] = result.emn_email;
//       }
//       if (result.emn_firstname) {
//         obj["firstname"] = result.emn_firstname;
//       }
//       if (result.emn_lastname) {
//         obj["lastname"] = result.emn_lastname;
//       }
//       return obj;
//     });
//     let req = [];
//     for (let i = 0; i < data_prom.length; i++) {
//       // await Crmsave(data_prom[i]);
//       req.push(Crmsave(data_prom[i]));
//     }
//     // console.log("Request");
//     // console.log(req);
//     console.timeEnd("PhoolanAdarsh");
//     res.json({ code: 200, data: data });
//     return Promise.all(req).then(res => console.log(res));
//   } catch (error) {}
// });

// async function Crmsave(data) {
//   let allPrmo = [];
//   if (data.email) {
//     let user = await User.findOne({ email: data.email });
//     if (user && user.firstname == null && !user.firstname) {
//       let prmo1 = User.findOneAndUpdate(
//         { email: data.email },
//         { $set: { firstname: data.firstname } }
//       );
//       allPrmo.push(prmo1);
//     }
//     if (user && user.lastname == null && !user.lastname) {
//       let prmo1 = User.findOneAndUpdate(
//         { email: data.email },
//         { $set: { lastname: data.lastname } }
//       );
//       allPrmo.push(prmo1);
//     } else if (user) {
//       // console.log("email is already exist");
//     } else {
//       let user = new User(data);
//       let prmo = user.save();
//       allPrmo.push(prmo);
//     }
//   }

//   return Promise.all(allPrmo);
// }
