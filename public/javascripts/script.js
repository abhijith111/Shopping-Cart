
function addToCart(productId, user) {
    if (user) {
        $.ajax({
            url: "/add-to-cart/" + productId,
            method: "get",
            success: function (response) {
                console.log("ajax call success ... :)");
            },
        });
    } else {
        alert('Please Login..');
    }
}

function changeProductCount(proId, user, opp) {
    $.ajax({
        url: '/change-product-count/',
        data: {
            productId: proId,
            userId: user,
            count: opp
        },
        method: "post",
        success: () => {

        }
    })
}