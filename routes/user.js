const { response } = require("express");
var express = require("express");
const session = require("express-session");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
    if (req.session.userLoggedIn) {
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
    if (req.session.userLoggedIn) {
        res.redirect("/");
    } else {
        res.render("user/user-login", { loginErrFlag: req.session.userLoginErr });
        req.session.userLoginErr = false;
    }
});

router.get("/signup", (req, res) => {
    res.render("user/user-signup");
});
router.post("/signup", (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        req.session.userLoggedIn = true;
        req.session.user = response;
        //console.log(response);
    });
    res.redirect("/login");
});

router.post("/login", (req, res) => {
    userHelpers.dologin(req.body).then((response) => {
        if (response.status) {
            req.session.user = response.user;
            req.session.userLoggedIn = true;
            //console.log(response.user);
            res.redirect("/");
        } else {
            req.session.userLoginErr = true;
            res.redirect("/login");
        }
    });
});

router.get("/logout", (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = null;
    res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
    let user = req.session.user;
    let productsInCart = await userHelpers.getProductsInCart(user._id);
    let total = await userHelpers.getTotalAmount(user._id);
    //console.log(productsInCart);
    res.render("user/cart", { user, productsInCart, total });
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
    // console.log("Api call");
    userHelpers.addToCart(req.session.user._id, req.params.id).then(() => {
        userHelpers.getCartCount(req.session.user._id).then((response) => {
            res.json(response);
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
router.get("/orders", verifyLogin, async (req, res) => {
    let totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/orders", { user: req.session.user, totalAmount });
});
router.post("/orders", verifyLogin, async (req, res) => {
    let totalAmount = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, totalAmount).then((response) => {
        if(response.payMode === 'online'){
            userHelpers.generateRazorpay(response._id,response.total).then((response)=>{
                response.payCod = false
                res.json(response);
            })
        }else if(response.payMode === 'cod'){
            res.json({payCod:true})
        }

    });
});

router.get("/order-success", verifyLogin, (req, res) => {
    res.render("user/order-success", { user: req.session.user });
});

router.get("/order-summary", verifyLogin, (req, res) => {
    userHelpers.getOrderDetails(req.session.user._id).then((orderDetails) => {
        for (dateValue in orderDetails) {
            orderDetails[dateValue].date =
                orderDetails[dateValue].date.getDate() +
                "-" +
                (parseInt(orderDetails[dateValue].date.getMonth()) + 1) +
                "-" +
                orderDetails[dateValue].date.getFullYear();
        }
        res.render("user/order-summary", {
            user: req.session.user,
            orderDetails,
        });
    });
});
router.post('/verify-payment',(req,res)=>{
    userHelpers.verifyPayment(req.body).then(()=>{
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then((response) => {
            res.json({paymentStatus:true})
        })
    }).catch((err)=> {
        res.json({paymentStatus:false})
    })
})
router.get('/view-ordered-products/:id',verifyLogin,(req,res) => {
    userHelpers.getOrderedProducts(req.params.id).then((response)=>{
        res.json(response)
    })
})
module.exports = router;
