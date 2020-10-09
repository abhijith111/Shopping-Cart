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
  addToCart: (uId, pId) => {
    return new Promise(async (resolve, reject) => {
      let userExist = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: objectId(uId) });
      if (userExist) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { userId: objectId(uId) },
            {
              $push: { products: objectId(pId) },
            }
          ).then(() => {
            resolve("product added to cart of existing user's cart")
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne({
            userId: objectId(uId),
            products: [objectId(pId)],
          })
          .then(() => {
            resolve("new cart created for the user");
          });
      }
    });
  },
};
