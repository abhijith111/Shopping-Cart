var db = require('../config/connection');
var collection = require('../config/collections');


module.exports = {
    addToCart: (productId,userId) => {
        return new Promise ((resolve, reject) => {
            db.collection(collection.USER_CART).insertOne()
        })
    }
}