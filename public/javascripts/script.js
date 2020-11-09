
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
        if (confirm("Please Login")) {
            location.href = "/login";
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
            
            if (response.payCod) {
                location.href = "/order-success/";
            } else {
                razorpayPayment(response);
            }
        },
    });
});

function razorpayPayment(order) {
    var options = {
        key: "rzp_test_e7OF7N8GMEoRU5", // Enter the Key ID generated from the Dashboard
        amount: ((order.amount)*1000), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Shopping-Cart",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response) {
            verifyPayment(response, order);
        },
        prefill: {
            name: "Gaurav Kumar",
            email: "gaurav.kumar@example.com",
            contact: "9999999999",
        },
        notes: {
            address: "Razorpay Corporate Office",
        },
        theme: {
            color: "#3399cc",
        },
    };
    var rzp1 = new Razorpay(options);

    rzp1.on("payment.failed", function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
    });

    rzp1.open();
    
}

function verifyPayment(payment, order) {
    $.ajax({
        url: "/verify-payment",
        method: 'POST',
        data: { payment, order },
        success: (response)=>{
            if (response.paymentStatus){
                alert('payment success')
            }else{
                alert('payment failed')
            }
        }
    });
}
