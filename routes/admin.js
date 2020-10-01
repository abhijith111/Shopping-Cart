var express = require('express');
const app = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers')

router.get('/', function (req, res) {
  productHelpers.getAllProducts().then((products) =>{
    res.render('admin/view-products', { admin: true, products });
  })
});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { admin: true });
})

router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body).then((id) => {
    let image = req.files.image;
    image.mv('./public/images/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-product');
      }else{
        console.log(err);
      }
    });
  });
})

module.exports = router;