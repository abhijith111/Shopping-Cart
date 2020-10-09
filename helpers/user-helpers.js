var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
module.exports = {
  doSignup: (user) => {
    return new Promise(async (resolve, reject) => {
      user.password = await bcrypt.hash(user.password, 10);
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .insertOne(user)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },
  dologin: (user) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let userAtDB = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: user.email });
      if (userAtDB) {
        bcrypt.compare(user.password, userAtDB.password).then((status) => {
          if (status) {
            console.log("login Success");
            response.user = userAtDB;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("user not found");
        resolve({ status: false });
      }
    });
  },
  addToCart: (userId, productId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: objectId(userId) });
      console.log(userExist);
      if (userExist) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { userId: objectId(userId) },
            {
              $set: {
                $push: objectId(products),
              },
            }
          );
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne({
            userId: objectId(userId),
            products: [objectId(productId)],
          })
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
};