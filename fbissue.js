require("./DB");
let User = require("./schema");
let express = require("express");
const _ = require("lodash");
let app = express();
let faker = require("faker");
let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// req email, social_type, social_id
app.post("/social", async (req, res) => {
  let { email, socialType, socialId } = req.body;
  console.log(req.body);
  let user = null;
  try {
    if (socialType == "facebook" || socialType == "google") {
      user = await User.findOne({
        socialId: socialId,
        socialType: socialType
      });
      if(!user.socialId){
        alert("Nahi hai")
      }
    } 
    console.log(user);
    res.json({ user });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, function(err, message) {
  if (err) throw err;
  console.log("app is running at port 3000");
});
