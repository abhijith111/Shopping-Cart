const { response } = require("express");
var express = require("express");
const session = require("express-session");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const varifyLogin = (req,res,next) => {
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
}

/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user });
    //console.log(user);
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

router.get('/cart',varifyLogin,(req,res) => {
  let user = req.session.user;
  res.render('user/cart',{user});
})

router.get('/add-to-cart/:id',varifyLogin,(req,res) => {
  userHelpers.addToCart(req.session.user._id,req.params.id).then((response) => {
    console.log(response);
  })
  res.redirect ('/');
}) 

module.exports = router;
