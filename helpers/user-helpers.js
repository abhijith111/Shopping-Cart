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
                console.log(cart);
                resolve({count: cart.products.length,cart});
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
                    resolve({ itemRemoveFlag: true });
                });
        });
    },
    getTotalAmount: (userId) => {
        return new Promise((reslove, reject) => {
            db.get()
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
                    {
                        $project: {
                            userId: 1,
                            count: 1,
                            products: { $arrayElemAt: ["$products", 0] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: [
                                        "$count",
                                        { $toInt: "$products.product__price" },
                                    ],
                                },
                            },
                        },
                    },
                ])
                .toArray()
                .then((response) => {
                    reslove(response[0].total);
                })
                .catch((err) => {
                    reslove(null);
                });
        });
    },
    placeOrder: (obj, TotalAmount) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.CART_COLLECTION)
                .findOne({ userId: objectId(obj.userId) })
                .then((response) => {
                    //console.log(obj);
                    //console.log(response);
                    let payStatus =
                        obj.payMode === "cod" ? "cod__pay" : "online__pending";
                    //console.log(payStatus);
                    let orderObject = {
                        userId: objectId(obj.userId),
                        deliveryDetails: {
                            address: obj.address,
                            pincode: obj.pincode,
                            phno: obj.phno,
                        },
                        total: TotalAmount,
                        payMode: obj.payMode,
                        products: response.products,
                        payStatus: payStatus,
                        date: new Date(),
                    };
                    db.get()
                        .collection(collection.ORDER_COLECTION)
                        .insertOne(orderObject)
                        .then((insertObject) => {
                            db.get()
                                .collection(collection.CART_COLLECTION)
                                .removeOne({ userId: objectId(obj.userId) }).then(()=>{
                                    resolve(insertObject)
                                });
                        });
                });
        });
    },
    getOrderDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLECTION)
                .find({
                    userId: objectId(userId),
                }).toArray()
                .then((response) => {
                    resolve(response);
                });
        });
    },
};