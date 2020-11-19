var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");

module.exports = {
    // addSuperUser: ()=>{
    //     return new Promise ( async(resolve, reject) => {
    //         let superAdmin = {
    //             userName : "Super Admin",
    //         }
    //         superAdmin.password = await bcrypt.hash("superuser123",10)

    //         db.get().collection(collection.SUPER_ADMIN_COLLECTION).insertOne(superAdmin).then((response) => {
    //             resolve(response);
    //         })
    //     })
    // },

    doLogin: (obj) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.SUPER_ADMIN_COLLECTION)
                .findOne({ userName: obj.user__name })
                .then((response) => {
                    if (response) {
                        bcrypt
                            .compare(obj.password, response.password)
                            .then((status) => {
                                if (status) {
                                    resolve({login: true});
                                }else{
                                    resolve({login: false});
                                }
                            });
                    }else{
                        resolve({login: false});
                    }
                });
        });
    },
};
