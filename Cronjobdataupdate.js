const async = require('async'),
    path = require('path'),
    fetch = require('node-fetch');
mongoose = require('mongoose')
moment = require('moment')
tz = require('moment-timezone')
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
    Mongo_logs = require(path.resolve('./app/models/mongotocrmlog')),
    User = require(path.resolve('./app/models/webusers')),
    DynamicsWebApi = require('dynamics-web-api'),
    AuthenticationContext = require('adal-node').AuthenticationContext,
    needle = require('needle'),
    Mailer = require(path.resolve('./app/config/libs/mailer')),
    InvestorLift = require(path.resolve('./app/config/libs/investorlift/investorlift')),
    InvestorLiftMapper = require(path.resolve('./app/config/libs/investorlift/mapper'));

module.exports = class CrmsyncController {

    // constructor(){

    // }


    /**
     * Property Cms
     * @param {Object} req [Requested parameter]
     * @param {Object} res [Response]
     * @return {Object} [Property detail object]
     */
    // prpertyCms(req, res, next) {
    //     PropertyCms.find({
    //         "status": true
    //     }, (err, result) => {
    //         if (err) {
    //             res.json(
    //                 wrapper.error({
    //                     message: err
    //                 })
    //             );
    //         } else {
    //             res.json(wrapper.success({
    //                 result
    //             }));
    //         }
    //     });
    // }
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
        var resource = config.dynamics.resource;
        var dynamicsWebApi = new DynamicsWebApi({
            webApiUrl: resource + '/api/data/v8.2/',
            onTokenRefresh: getToken,
            rejectUnauthorized: false,
            includeAnnotations: "OData.Community.Display.V1.FormattedValue",
        });



        Crm_logs.aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }]).then((response) => {
            let lastlogtime = response[0]['date']
            console.log("this is my date", lastlogtime)

            let fetchXmlQuery =
                '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">' +
                ' <entity name="emn_agent">' +
                ' <attribute name="emn_workphone" />' +
                '<attribute name="emn_mobilephone" />' +
                ' <attribute name="emn_lastname" />' +
                '<attribute name="emn_homephone" />' +
                ' <attribute name="emn_firstname" />' +
                '<attribute name="emn_ext" />' +
                '<attribute name="emn_email" />' +
                ' <attribute name="emn_fullname" />' +
                '<attribute name="createdon" />' +
                '<attribute name="modifiedon" />' +
                ' <attribute name="emn_agentid" />' +
                '<filter type="and">' +
                ' <condition attribute="emn_email" operator="not-null" />' +
                '</filter>' +

                '<filter type="and">' +
                '<condition attribute="modifiedon" operator="on-or-after" value="' + lastlogtime + '" descending="true" />' +
                '</filter>' +
                // '<filter type="and">' +
                // // '<condition attribute="modifiedon" operator="not-null" />' +
                // '<condition attribute="createdon" operator="on-or-after" value="1/16 /2020" />' +
                // '</filter>' +
                ' <order attribute="emn_email" descending="false" />' +
                '<link-entity name="emn_agent_mm_emn_outsalecontract" from="emn_agentid" to="emn_agentid" visible="false" intersect="true" link-type="outer">' +
                '<link-entity name="emn_outsalecontract" from="emn_outsalecontractid" to="emn_outsalecontractid" alias="aa" link-type="outer">' +
                '<attribute name="emn_outsalecontractid" />' +
                '<attribute name="createdon" />' +
                '<order attribute="createdon" descending="true" />' +
                '<link-entity name="new_propertydetails" from="new_propertydetailsid" to="emn_propertyrecordid" link-type="outer" alias="ab">' +
                '<attribute name="new_propertydetailsid" />' +
                '<attribute name="createdon" />' +
                '<attribute name="new_propcounty" />' +

                '<attribute name="new_marketname" />' +

                '<order attribute="createdon" descending="true" />' +

                '</link-entity>' +

                '</link-entity>' +

                '</link-entity>' +

                ' </entity>' +

                '</fetch>';




            //perform a multiple records retrieve operation
            dynamicsWebApi.executeFetchXmlAll("emn_Agents", fetchXmlQuery).then(async function (response) {
                console.log("new crm data", response.value)

                try {
                    let data = response.value
                    let uniqueValue = getUnique(data)



                    // let compare = [];

                    console.log("my data is here", uniqueValue);

                    res.json({
                        data: uniqueValue
                    })
                    let allProm = [];
                    let logCount = 0;
                    uniqueValue.forEach(result => {
                        let crmObj = {}
                        crmObj['user_type'] = 3

                        crmObj['crmuser'] = "crmusers"
                        crmObj['source'] = "manual"
                        if (result.emn_firstname) {
                            crmObj['firstname'] = result.emn_firstname
                        }
                        if (result.emn_lastname) {
                            crmObj['lastname'] = result.emn_lastname
                        }
                        if (result.emn_email) {
                            crmObj['email'] = result.emn_email


                        }
                        if (result.ab_x002e_new_propcounty) {
                            crmObj['renovated_county'] = result.ab_x002e_new_propcounty
                        }

                        if (result.ab_x002e_new_marketname) {
                            crmObj['renovated_market'] = result["ab_x002e_new_marketname@OData.Community.Display.V1.FormattedValue"]
                        }

                        if (result.emn_mobilephone) {
                            crmObj['mobile'] = result.emn_mobilephone
                            crmObj['communication'] = 1
                        } else {
                            crmObj['communication'] = 2

                        }
                        allProm.push(
                            crmSave(crmObj, () => {
                                logCount++;
                            })
                        );

                    })
                    await Promise.all(allProm);
                    let date = new Date(Date.now());
                    let newdate = moment(date).format(" M/DD/YYYY ")
                    console.log("new date is here", newdate)
                    // let crmdate =  date.toLocaleString('en-GB', { hour12:false })
                    const crmlog = new Crm_logs({
                        date: newdate,
                        Number_of_Agent_from_Crm: logCount
                    })

                    crmlog.save();
                    return;

                } catch (error) {
                    console.log(error)
                }

            }).catch(function (error) {
                console.log("error is cause", error)
            });

            // save crm value in database

            async function crmSave(data, logUpdater) {
                console.log("yief", data)
                let allPrmoise = [];
                console.log("this is data email", data.email)

                let user = await User.findOne({
                    email: data.email
                });


                if (user && !user.firstname) {
                    let prom1 = User.findOneAndUpdate({
                        email: data.email,
                    }, {
                        $set: {
                            firstname: data.firstname
                        }
                    });

                    allPrmoise.push(prom1);
                }
                if (user && !user.lastname) {
                    let prom2 = User.findOneAndUpdate({
                        email: data.email,
                    }, {
                        $set: {
                            lastname: data.lastname
                        }
                    });

                    allPrmoise.push(prom2);
                }
                if (user && !user.mobile) {
                    let prom3 = User.findOneAndUpdate({
                        email: data.email,
                    }, {
                        $set: {
                            mobile: data.mobile,
                        }
                    });
                    allPrmoise.push(prom3);
                } else if (user) {
                    console.log("email is already exist");
                } else {

                    let user = new User(data);
                    let prom4 = user.save();
                    logUpdater();
                    allPrmoise.push(prom4);
                }
                return Promise.all(allPrmoise);
            }


            function getUnique(data) {
                let recentdata = data.sort(function (a, b) {
                    return (new Date(b.modifiedon) - new Date(a.modifiedon))
                    //  console.log(recentdata)
                });
                let reversearray = recentdata.reverse();
                console.log("thi is reveresedata", reversearray)

                let newArray = [];
                let uniqueObject = {};
                for (let i in reversearray) {
                    let objTitle = reversearray[i]['emn_email'];
                    uniqueObject[objTitle] = reversearray[i];
                }
                for (let i in uniqueObject) {
                    newArray.push(uniqueObject[i]);
                }
                return newArray;
            }

        })


        // remove duplicate emails 

    }

    /*   @@ static mongocrm function


     * 
     *
     */


    //*************************Mongo to Crm send data ******* ******************

    static mongotoCrm(req, res) {
        let mongologtime;
        var resource = config.dynamics.resource;
        var dynamicsWebApi = new DynamicsWebApi({
            webApiUrl: resource + '/api/data/v8.2/',
            onTokenRefresh: getToken,
            rejectUnauthorized: false
        });

        try {

            Mongo_logs.aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }]).then((response) => {
                mongologtime = response[0]['date']

                User.find({
                    user_type: { $in: [3] },
                    "updated_at": { $gte: mongologtime }
                }).then(async function (response) {

                    let data = response


                    let allUser = [];
                    let crmCount = 0;
                    let mongodata = data.map(result => {
                        let mongoObj = {}
                        if (result.firstname) {
                            mongoObj['emn_firstname'] = result.firstname
                        }
                        if (result.lastname) {
                            mongoObj['emn_lastname'] = result.lastname
                        }
                        if (result.email) {
                            mongoObj['emn_email'] = result.email
                        }
                        if (result.mobile) {
                            mongoObj['emn_mobilephone'] = result.mobile

                        }
                        console.log("my result", result)
                        // return mongoObj
                        allUser.push(
                            webuserSave(mongoObj, () => {
                                crmCount++;

                            }))


                    })

                    await Promise.all(allUser)
                    let date = new Date(Date.now());
                    let newdate = moment(date).format(" M/DD/YYYY ")
                    console.log("new date is here", newdate)
                    const mongo_log = new Mongo_logs({
                        date: newdate,
                        Number_of_Agent_from_Mongo: crmCount
                    })

                    mongo_log.save()

                    // test()


                    // console.log("logs save")
                    // test()
                    res.json({
                        code: 200,
                        data: data
                    });

                    return

                    //  console.log(data)
                })

            }).catch(function (error) {
                console.log("this is", error)
            })

        }
        catch (error) {
            console.log(error)
        }




        async function webuserSave(data, valueUpdater) {
            var request = {
                collection: "emn_Agents",
                select: [
                    "emn_firstname",
                    "emn_lastname",
                    "emn_mobilephone",
                    "emn_email"
                ],
                filter: "emn_email eq  '" + data.emn_email + "' "
            };
            let response = await dynamicsWebApi.retrieveAllRequest(request)

            if (response && Array.isArray(response.value) && response.value.length > 0) {
                response.value.map(async crm_value => {
                    let agentId = crm_value.emn_agentid.toString();
                    if (!crm_value.emn_lastname) {
                        crm_value.emn_lastname = data.emn_lastname;
                    }
                    if (!crm_value.emn_firstname) {
                        crm_value.emn_firstname = data.emn_firstname;
                    }
                    if (!crm_value.emn_mobilephone) {
                        crm_value.emn_mobilephone = data.emn_mobilephone;
                    }
                    console.log("my crm value", crm_value)

                    dynamicsWebApi
                        .update(agentId, "emn_Agents", crm_value)
                        .then(function (id) {
                            console.log("update crm id", id);
                            id = id;
                            console.log("after update", response.value);

                        })
                        .catch(function (error) {
                            console.log("error----------", error);
                        })

                });
            }
            // else if (response) {
            //     console.log("email is alreay exist")
            // }
            else {
                await dynamicsWebApi
                    .create(data, "emn_Agents")
                    .then(function (id) {
                        valueUpdater();
                        // AgentId = id
                        console.log("USER SAVED", id);

                    })

                    .catch(function (error) {
                        console.log("this", error);
                    });
            }
        }



    }

}






// async function getUnique(data) {
//     let recentdata = data.sort(function (a, b) {
//         return (new Date(b.modifiedon) - new Date(a.modifiedon))
//         //  console.log(recentdata)
//     });
//     let reversearray = recentdata.reverse();
//     console.log(reversearray)

//     let newArray = [];
//     let uniqueObject = {};
//     for (let i in reversearray) {
//         let objTitle = reversearray[i]['emn_email'];
//         uniqueObject[objTitle] = reversearray[i];
//     }
//     for (let i in uniqueObject) {
//         newArray.push(uniqueObject[i]);
//     }
//     return newArray;

// }








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
