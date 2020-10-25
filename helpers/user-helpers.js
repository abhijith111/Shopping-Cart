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
                bcrypt
                    .compare(user.password, userAtDB.password)
                    .then((status) => {
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
            count: 1,
        };
        return new Promise(async (resolve, reject) => {
            let userExist = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ userId: objectId(uId) });
            if (userExist) {
                let proExist = userExist.products.findIndex(
                    (products) => products.productId == pId
                );
                if (proExist != -1) {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            {
                                userId: objectId(uId),
                                "products.productId": objectId(pId),
                            },
                            {
                                $inc: { "products.$.count": 1 },
                            }
                        )
                        .then(() => {
                            resolve(true);
                        });
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { userId: objectId(uId) },
                            {
                                $push: { products: proObj },
                            }
                        )
                        .then(() => {
                            resolve(true);
                        });
                }
            } else {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .insertOne({
                        userId: objectId(uId),
                        products: [proObj],
                    })
                    .then(() => {
                        console.log(
                            "inside user helpers .. tying to add product to fresh cart"
                        );
                        resolve(true);
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
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            userId: "$userId",
                            productId: "$products.productId",
                            count: "$products.count",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "productId",
                            foreignField: "_id",
                            as: "products",
                        },
                    },
                ])
                .toArray();
            resolve(cartItems);
        });
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ userId: objectId(userId) });
            if (cart) {
                resolve(cart.products.length);
            } else {
                resolve(0);
            }
        });
    },
    changeCartCount: (obj) => {
        return new Promise((resolve, reject) => {
            obj.count = parseInt(obj.count);
            obj.opp = parseInt(obj.opp);
            if (obj.count == 1 && obj.opp == -1) {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            userId: objectId(obj.userId),
                            "products.productId": objectId(obj.productId),
                        },
                        {
                            $pull: {
                                products: {
                                    productId: objectId(obj.productId),
                                },
                            },
                        }
                    )
                    .then(() => {
                        resolve({ itemRemoved: true });
                    });
            } else {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            userId: objectId(obj.userId),
                            "products.productId": objectId(obj.productId),
                        },
                        {
                            $inc: { "products.$.count": obj.opp },
                        }
                    )
                    .then(() => {
                        let newCount = obj.count + obj.opp;
                        resolve({ itemRemoved: false, count: newCount });
                    });
            }
        });
    },
    removeProduct: (req) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                    {
                        userId: objectId(req.userId),
                        "products.productId": objectId(req.productId),
                    },
                    {
                        $pull: {
                            products: {
                                productId: objectId(req.productId),
                            },
                        },
                    }
                )
                .then(() => {
                    resolve({itemRemoveFlag: true})
                });
        });
    },
};

// {
//     productId: '5f7e9843ccf21c117dfa0411',
//     userId: '5f7a179198584356231ecd9c'
//   }
