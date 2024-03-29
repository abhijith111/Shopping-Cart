var express = require("express");
const app = require("../app");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
var fs = require("fs");
const session = require("express-session");
const adminHelpers = require("../helpers/admin-helpers");

router.get("/super-admin", (req, res) => {
    // adminHelpers.addSuperUser().then((response) => {
    //     console.log(response);
    // })
    res.render("admin/super-admin", { admin: true });
});

router.post("/superAdminLogin", (req, res) => {
    adminHelpers.doLogin(req.body).then((response) => {
        if (response.login) {
            res.render("admin/manage-admin", { admin: true });
        } else {
            res.send("Err__super__user__login");
        }
    });
});

router.get('/add-admin',(req,res)=> {
    res.render("admin/add-admin",{admin: true});
})
router.post('add-admin',(req,res)=>{
    console.log(req.body);
    res.send("admin add");
})

router.get("/", function (req, res) {
    productHelpers.getAllProducts().then((products) => {
        res.render("admin/view-products", { admin: true, products });
    });
});

router.get("/add-product", (req, res) => {
    res.render("admin/add-product", { admin: true });
});

router.post("/add-product", (req, res) => {
    //console.log(req.body);
    productHelpers.addProduct(req.body).then((id) => {
        let image = req.files.image;
        image.mv(
            "./public/images/product-images/" + id + ".jpg",
            (err, done) => {
                if (!err) {
                    res.render("admin/add-product", { admin: true });
                } else {
                    console.log(err);
                }
            }
        );
    });
});
router.get("/delete-product", (req, res) => {
    let productId = req.query.id;
    fs.unlinkSync("public/images/product-images/" + productId + ".jpg");
    productHelpers.delProduct(productId).then((response) => {
        res.redirect("/admin");
    });
});

router.get("/edit-product/:id", async (req, res) => {
    let productId = req.params.id;
    let product = await productHelpers.getProductDetails(productId);
    res.render("admin/edit-product", { product, admin: true });
});

router.post("/edit-product/:id", (req, res) => {
    productHelpers.updateProduct(req.params.id, req.body).then((response) => {
        res.redirect("/admin");
        if (req.files.image) {
            let image = req.files.image;
            //console.log(image);
            image.mv(
                "public/images/product-images/" + req.params.id + ".jpg",
                (err, done) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    });
});
module.exports = router;
