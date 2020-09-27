var db = require('../config/connection');
var collection = require('../config/collections')

module.exports = {
    addProduct: (product) => {
        return new Promise(async(resolve,reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data.ops[0]._id);
            });
        });
        // db.get().collection('product').insertOne(product).then((data) => {
        //     callback(data.ops[0]._id);
        // });
    },
    getAllProducts: () => {
        return new Promise(async (resolve,reject) =>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    }
}