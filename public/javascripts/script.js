function addToCart(productId) {
    console.log("Hi there.. inside public javascript");
    $.ajax({
        url: "/add-to-cart/" + productId,
        method: "get",
        success: (response) => {
            console.log(response);
        },
    });
}
