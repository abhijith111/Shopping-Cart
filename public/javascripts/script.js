function addToCart(productId,user) {
    if(user){
        $.ajax({
            url: "/add-to-cart/" + productId,
            method: "get",
            success: function (response) {
                console.log("ajax call success ... :)");
            },
        });
    }else{
        alert('Please Login..');
    }
}

