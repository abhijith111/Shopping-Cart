function addToCart(productId, user) {
    if (user) {
        $.ajax({
            url: "/add-to-cart/" + productId,
            method: "get",
            success: function (response) {
                if (response) {
                    document.getElementById(
                        "navBarCartCount"
                    ).innerHTML = response;
                }
            },
        });
    } else {
        if(confirm("Please Login")){
            location.href='/login';
        }
    }
}


function changeProductCount(proId, user, opp) {
    let currentCount = document.getElementById(proId).innerHTML;
    $.ajax({
        url: "/change-product-count/",
        data: {
            productId: proId,
            userId: user,
            opp: opp,
            count: currentCount,
        },
        method: "post",
        success: (response) => {
            if (response.itemRemoved) {
                alert("Item Removed.");
                location.reload();
            } else {
                document.getElementById(proId).innerHTML = response.count;
                document.getElementById("totalAmount").innerHTML =
                    response.totalAmount;
            }
        },
    });
}

function removeProduct(proId, userId) {
    let confirmFlag = confirm("you want to delete this item ?");
    if (confirmFlag) {
        $.ajax({
            url: "/remove-product/",
            data: {
                productId: proId,
                userId: userId,
            },
            method: "post",
            success: (response) => {
                location.reload();
            },
        });
    }
}

$("#checkout__form").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: "/orders/",
        method: "POST",
        data: $("#checkout__form").serialize(),
        success: (response) => {
            location.href='/order-success/'
        },
    });
});
