var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
var objectId = require("mongodb").ObjectID;

//export module as product helpers
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
    let proObj = {
      productId: objectId(pId),
      count: 1
    }
    return new Promise(async (resolve, reject) => {
      let userExist = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: objectId(uId) });
      if (userExist) {
        let proExist = userExist.products.findIndex(products => products.productId == pId)
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne(
            { 'products.productId': objectId(pId) },
            {
              $inc: { 'products.$.count': 1 }
            }
          ).then(()=>{
            resolve();
          })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne(
            { userId: objectId(uId) },
            {
              $push: { products: proObj },
            }).then((response) => {
              resolve(response);
            });
        }
      } else {
        db.get().collection(collection.CART_COLLECTION).insertOne(
          {
            userId: objectId(uId),
            products: [proObj]
          }).then((response) => {
            console.log("inside user helpers .. tying to add product to fresh cart");
            resolve(response);
          });
      }
    });
  },


  getProductsInCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { userId: objectId(userId) },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              let: { productList: "$products" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$productList"],
                    },
                  },
                },
              ],
              as: "cartItems",
            },
          },
        ])
        .toArray();
      resolve(cartItems[0].cartItems);
    });
  },


  getCartCout: (userId) => {
    return new Promise(async (resolve, response) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ userId: objectId(userId) });
      if (cart) {
        resolve(cart.products.length);
      } else {
        resolve(0)
      }
    });
  },
};
