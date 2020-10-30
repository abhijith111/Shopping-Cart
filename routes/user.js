const { response } = require("express");
var express = require("express");
const session = require("express-session");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const varifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

router.get("/", async function (req, res, next) {
    let user = req.session.user;
    let cartCount = null;
    if (user) {
        cartCount = await userHelpers.getCartCount(user._id);
    }
    productHelpers.getAllProducts().then((products) => {
        res.render("user/view-products", { products, user, cartCount });
    });
});

router.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        res.render("user/user-login", { loginErrFlag: req.session.loginErr });
        req.session.loginErr = false;
    }
});

router.get("/signup", (req, res) => {
    res.render("user/user-signup");
});
router.post("/signup", (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        req.session.loggedIn = true;
        req.session.user = response;
        //console.log(response);
    });
    res.redirect("/login");
});

router.post("/login", (req, res) => {
    userHelpers.dologin(req.body).then((response) => {
        if (response.status) {
            req.session.user = response.user;
            req.session.loggedIn = true;
            //console.log(response.user);
            res.redirect("/");
        } else {
            req.session.loginErr = true;
            res.redirect("/login");
        }
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

router.get("/cart", varifyLogin, async (req, res) => {
    let user = req.session.user;
    let productsInCart = await userHelpers.getProductsInCart(user._id);
    let total = await userHelpers.getTotalAmount(user._id);
    //console.log(productsInCart);
    res.render("user/cart", { user, productsInCart, total });
});

router.get("/add-to-cart/:id", varifyLogin, (req, res) => {
    // console.log("Api call");
    userHelpers.addToCart(req.session.user._id, req.params.id).then(() => {
        userHelpers.getCartCount(req.session.user._id).then((response) => {
            res.json(response);
            console.log(response);
        });
    });
});

router.post("/change-product-count", (req, res, next) => {
    userHelpers.changeCartCount(req.body).then(async (response) => {
        // console.log(response);
        let total = await userHelpers.getTotalAmount(req.body.userId);
        response.totalAmount = total;
        res.json(response);
    });
});

router.post("/remove-product", (req, res) => {
    userHelpers.removeProduct(req.body).then((response) => {
        res.json(response);
    });
});
router.get("/orders", varifyLogin, async (req, res) => {
    let totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/orders", { user: req.session.user, totalAmount });
});
router.post("/orders", varifyLogin, async (req, res) => {
    console.log(req.body);
    let totalAmount = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, totalAmount).then((response) => {
        res.json(response);
    });
    //console.log(req.body);
});

router.get("/order-success", (req, res) => {
    res.render('user/order-success');
});

router.get('/order-summary',varifyLogin,(req,res)=> {
    userHelpers.getOrderDetails(req.session.user._id).then((response)=> {
        console.log(response);
        res.render('user/order-summary',{user:req.session.user,})
    })
})
module.exports = router;
