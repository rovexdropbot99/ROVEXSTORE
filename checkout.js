/* =====================================================
   ROVEX STORE
   CHECKOUT.JS
   FIRESTORE ORDER SYSTEM
===================================================== */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       ELEMENTS
    ================================================= */

    const productNameEl = document.getElementById("checkoutProductName");
    const categoryEl = document.getElementById("checkoutCategory");
    const quantityEl = document.getElementById("checkoutQuantity");
    const priceEl = document.getElementById("checkoutPrice");

    const summaryProductEl = document.getElementById("summaryProduct");
    const summaryCategoryEl = document.getElementById("summaryCategory");
    const summaryQuantityEl = document.getElementById("summaryQuantity");
    const summaryTotalEl = document.getElementById("summaryTotal");

    const playerIdEl = document.getElementById("playerId");
    const serverIdEl = document.getElementById("serverId");
    const serverGroupEl = document.getElementById("serverGroup");

    const receiptEl = document.getElementById("receipt");
    const receiptPreviewEl = document.getElementById("receiptPreview");
    const receiptImageEl = document.getElementById("receiptImage");
    const receiptFileNameEl = document.getElementById("receiptFileName");
    const removeReceiptBtn = document.getElementById("removeReceipt");

    const orderNoteEl = document.getElementById("orderNote");

    const messageEl = document.getElementById("checkoutMessage");
    const placeOrderBtn = document.getElementById("placeOrderBtn");


    /* =================================================
       CURRENT USER
    ================================================= */

    let currentUser = null;


    /* =================================================
       GET SELECTED PRODUCT
    ================================================= */

    let selectedProduct = null;

    try {

        const savedProduct =
            localStorage.getItem("rovexSelectedProduct");

        if (savedProduct) {

            selectedProduct =
                JSON.parse(savedProduct);

        }

    } catch (error) {

        console.error(
            "Could not read selected product:",
            error
        );

    }


    /* =================================================
       PRODUCT FROM URL
    ================================================= */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const urlProductId =
        urlParams.get("product");


    if (!selectedProduct && urlProductId) {

        selectedProduct = {

            id: urlProductId,

            name:
                formatProductName(
                    urlProductId
                ),

            category:
                getCategoryFromId(
                    urlProductId
                ),

            quantity: 1,

            price: null

        };

    }


    /* =================================================
       NO PRODUCT
    ================================================= */

    if (!selectedProduct) {

        showMessage(
            "No product selected. Please go back and select a product.",
            "error"
        );

        if (placeOrderBtn) {

            placeOrderBtn.disabled = true;

        }

        if (productNameEl) {

            productNameEl.textContent =
                "No Product Selected";

        }

        return;

    }


    /* =================================================
       NORMALIZE DATA
    ================================================= */

    const productId =
        selectedProduct.id || "";

    const productName =
        selectedProduct.name ||
        "Unknown Product";

    const category =
        selectedProduct.category ||
        getCategoryFromId(productId);

    const quantity =
        Number(selectedProduct.quantity) > 0
            ? Number(selectedProduct.quantity)
            : 1;


    /* =================================================
       PRICE
    ================================================= */

    let price = null;

    if (
        selectedProduct.price !== undefined &&
        selectedProduct.price !== null &&
        selectedProduct.price !== ""
    ) {

        const numericPrice =
            Number(
                String(selectedProduct.price)
                    .replace(/,/g, "")
                    .replace(/[^\d.]/g, "")
            );

        if (!Number.isNaN(numericPrice)) {

            price =
                numericPrice;

        }

    }


    /* =================================================
       DISPLAY PRODUCT
    ================================================= */

    if (productNameEl) {

        productNameEl.textContent =
            productName;

    }

    if (categoryEl) {

        categoryEl.textContent =
            category;

    }

    if (quantityEl) {

        quantityEl.textContent =
            quantity;

    }

    if (summaryProductEl) {

        summaryProductEl.textContent =
            productName;

    }

    if (summaryCategoryEl) {

        summaryCategoryEl.textContent =
            category;

    }

    if (summaryQuantityEl) {

        summaryQuantityEl.textContent =
            quantity;

    }


    updatePriceDisplay();


    /* =================================================
       SERVER ID
    ================================================= */

    if (
        category.toUpperCase() ===
        "MLBB"
    ) {

        if (serverGroupEl) {

            serverGroupEl.style.display =
                "";

        }

    } else {

        if (serverGroupEl) {

            serverGroupEl.style.display =
                "none";

        }

        if (serverIdEl) {

            serverIdEl.value =
                "";

        }

    }


    /* =================================================
       RECEIPT UPLOAD
    ================================================= */

    if (receiptEl) {

        receiptEl.addEventListener(
            "change",
            handleReceiptUpload
        );

    }


    /* =================================================
       REMOVE RECEIPT
    ================================================= */

    if (removeReceiptBtn) {

        removeReceiptBtn.addEventListener(
            "click",
            removeReceipt
        );

    }


    /* =================================================
       PLACE ORDER
    ================================================= */

    if (placeOrderBtn) {

        placeOrderBtn.addEventListener(
            "click",
            placeOrder
        );

    }


    /* =================================================
       AUTH STATE
    ================================================= */

    onAuthStateChanged(
        auth,
        (user) => {

            currentUser =
                user || null;

            if (!user) {

                showMessage(
                    "Please login before placing an order.",
                    "error"
                );

                if (placeOrderBtn) {

                    placeOrderBtn.disabled =
                        false;

                }

                return;

            }

            clearMessage();

            console.log(
                "Logged in user:",
                user.uid
            );

        }
    );


    /* =================================================
       PRICE DISPLAY
    ================================================= */

    function updatePriceDisplay() {

        if (price === null) {

            if (priceEl) {

                priceEl.textContent =
                    "— MMK";

            }

            if (summaryTotalEl) {

                summaryTotalEl.textContent =
                    "— MMK";

            }

            return;

        }


        const total =
            price * quantity;


        if (priceEl) {

            priceEl.textContent =
                formatMMK(price);

        }


        if (summaryTotalEl) {

            summaryTotalEl.textContent =
                formatMMK(total);

        }

    }


    /* =================================================
       RECEIPT HANDLER
    ================================================= */

    function handleReceiptUpload(event) {

        const file =
            event.target.files &&
            event.target.files[0];


        if (!file) {

            return;

        }


        /* ---------------------------------------------
           FILE TYPE
        --------------------------------------------- */

        if (!file.type.startsWith("image/")) {

            showMessage(
                "Please upload an image receipt.",
                "error"
            );

            receiptEl.value =
                "";

            return;

        }


        /* ---------------------------------------------
           FILE SIZE
        --------------------------------------------- */

        const maxSize =
            5 * 1024 * 1024;


        if (file.size > maxSize) {

            showMessage(
                "Receipt image must be smaller than 5MB.",
                "error"
            );

            receiptEl.value =
                "";

            return;

        }


        /* ---------------------------------------------
           PREVIEW
        --------------------------------------------- */

        const reader =
            new FileReader();


        reader.onload =
            function () {

                if (receiptImageEl) {

                    receiptImageEl.src =
                        reader.result;

                }

                if (receiptFileNameEl) {

                    receiptFileNameEl.textContent =
                        file.name;

                }

                if (receiptPreviewEl) {

                    receiptPreviewEl.hidden =
                        false;

                }

            };


        reader.readAsDataURL(file);

        clearMessage();

    }


    /* =================================================
       REMOVE RECEIPT
    ================================================= */

    function removeReceipt() {

        if (receiptEl) {

            receiptEl.value =
                "";

        }

        if (receiptImageEl) {

            receiptImageEl.src =
                "";

        }

        if (receiptFileNameEl) {

            receiptFileNameEl.textContent =
                "Receipt";

        }

        if (receiptPreviewEl) {

            receiptPreviewEl.hidden =
                true;

        }

    }


    /* =================================================
       PLACE ORDER
    ================================================= */

    async function placeOrder() {

        clearMessage();


        /* ---------------------------------------------
           LOGIN CHECK
        --------------------------------------------- */

        if (!currentUser) {

            showMessage(
                "Please login before placing an order.",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           PLAYER ID
        --------------------------------------------- */

        const playerId =
            playerIdEl
                ? playerIdEl.value.trim()
                : "";


        if (!playerId) {

            showMessage(
                "Please enter your Player ID.",
                "error"
            );

            focusElement(
                playerIdEl
            );

            return;

        }


        /* ---------------------------------------------
           SERVER ID
        --------------------------------------------- */

        const serverId =
            serverIdEl
                ? serverIdEl.value.trim()
                : "";


        if (
            category.toUpperCase() ===
            "MLBB" &&
            !serverId
        ) {

            showMessage(
                "Please enter your Server ID.",
                "error"
            );

            focusElement(
                serverIdEl
            );

            return;

        }


        /* ---------------------------------------------
           PAYMENT METHOD
        --------------------------------------------- */

        const paymentInput =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );


        if (!paymentInput) {

            showMessage(
                "Please select a payment method.",
                "error"
            );

            return;

        }


        const paymentMethod =
            paymentInput.value;


        /* ---------------------------------------------
           RECEIPT
        --------------------------------------------- */

        const receiptFile =
            receiptEl &&
            receiptEl.files &&
            receiptEl.files[0];


        if (!receiptFile) {

            showMessage(
                "Please upload your payment receipt.",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           PRICE
        --------------------------------------------- */

        const totalAmount =
            price !== null
                ? price * quantity
                : null;


        /* ---------------------------------------------
           ORDER ID
        --------------------------------------------- */

        const orderId =
            createOrderId();


        /* ---------------------------------------------
           RECEIPT DATA
        --------------------------------------------- */

        let receiptData = "";


        /*
           Firebase Storage is not enabled on the
           current project plan.

           We therefore keep the image preview locally
           for this testing version.
        */

        if (receiptImageEl) {

            receiptData =
                receiptImageEl.src || "";

        }


        /* ---------------------------------------------
           NOTE
        --------------------------------------------- */

        const note =
            orderNoteEl
                ? orderNoteEl.value.trim()
                : "";


        /* ---------------------------------------------
           FIRESTORE ORDER
        --------------------------------------------- */

        const order = {

            id:
                orderId,

            uid:
                currentUser.uid,

            customerEmail:
                currentUser.email || "",

            customerName:
                currentUser.displayName || "",

            productId:
                productId,

            product:
                productName,

            category:
                category,

            quantity:
                quantity,

            playerId:
                playerId,

            serverId:
                serverId,

            amount:
                totalAmount,

            price:
                price,

            payment:
                paymentMethod,

            receiptName:
                receiptFile.name,

            /*
               Temporary local receipt data.
               Storage can replace this later.
            */
            receiptUrl:
                "",

            note:
                note,

            status:
                "Pending",

            date:
                new Date().toISOString(),

            createdAt:
                serverTimestamp()

        };


        /* ---------------------------------------------
           DISABLE BUTTON
        --------------------------------------------- */

        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

            placeOrderBtn.innerHTML =
                "<span>⏳</span> Placing Order...";

        }


        /* ---------------------------------------------
           SAVE TO FIRESTORE
        --------------------------------------------- */

        try {

            await addDoc(
                collection(
                    db,
                    "orders"
                ),
                order
            );


            /* -----------------------------------------
               SAVE LOCAL RECEIPT TEMPORARILY
            ----------------------------------------- */

            try {

                const existingOrders =
                    JSON.parse(
                        localStorage.getItem(
                            "rovexOrders"
                        ) || "[]"
                    );


                existingOrders.unshift({

                    ...order,

                    receiptUrl:
                        receiptData

                });


                localStorage.setItem(
                    "rovexOrders",
                    JSON.stringify(
                        existingOrders
                    )
                );

            } catch (localError) {

                console.warn(
                    "Local order backup failed:",
                    localError
                );

            }


            /* -----------------------------------------
               CLEAR SELECTED PRODUCT
            ----------------------------------------- */

            localStorage.removeItem(
                "rovexSelectedProduct"
            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            showMessage(
                "Order placed successfully! Order ID: " +
                orderId,
                "success"
            );


            if (placeOrderBtn) {

                placeOrderBtn.disabled =
                    true;

                placeOrderBtn.innerHTML =
                    "<span>✓</span> Order Placed";

            }


            /* -----------------------------------------
               REDIRECT
            ----------------------------------------- */

            setTimeout(
                () => {

                    window.location.href =
                        "my-order.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Firestore order error:",
                error
            );


            let errorMessage =
                "Could not place your order. Please try again.";


            if (
                error.code ===
                "permission-denied"
            ) {

                errorMessage =
                    "Permission denied. Please check Firestore Security Rules.";

            }


            showMessage(
                errorMessage,
                "error"
            );


            if (placeOrderBtn) {

                placeOrderBtn.disabled =
                    false;

                placeOrderBtn.innerHTML =
                    "<span>✓</span> Place Order";

            }

        }

    }


    /* =================================================
       CREATE ORDER ID
    ================================================= */

    function createOrderId() {

        const now =
            Date.now()
                .toString(36)
                .toUpperCase();


        const random =
            Math.random()
                .toString(36)
                .substring(
                    2,
                    7
                )
                .toUpperCase();


        return (
            "RVX-" +
            now +
            "-" +
            random
        );

    }


    /* =================================================
       FORMAT MMK
    ================================================= */

    function formatMMK(amount) {

        return (
            Number(amount)
                .toLocaleString("en-US") +
            " MMK"
        );

    }


    /* =================================================
       PRODUCT NAME FROM ID
    ================================================= */

    function formatProductName(id) {

        if (!id) {

            return "Unknown Product";

        }


        const parts =
            id.split("_");


        if (parts.length < 2) {

            return id;

        }


        const categoryName =
            parts[0].toUpperCase();


        const productValue =
            parts
                .slice(1)
                .join(" ");


        return (
            categoryName +
            " " +
            productValue
        );

    }


    /* =================================================
       CATEGORY FROM PRODUCT ID
    ================================================= */

    function getCategoryFromId(id) {

        if (!id) {

            return "Unknown";

        }


        const lower =
            id.toLowerCase();


        if (
            lower.startsWith(
                "mlbb_"
            )
        ) {

            return "MLBB";

        }


        if (
            lower.startsWith(
                "pubg_"
            )
        ) {

            return "PUBG";

        }


        if (
            lower.startsWith(
                "chatgpt"
            )
        ) {

            return "ChatGPT";

        }


        if (
            lower.startsWith(
                "gemini"
            )
        ) {

            return "Gemini";

        }


        return "Digital Product";

    }


    /* =================================================
       SHOW MESSAGE
    ================================================= */

    function showMessage(
        text,
        type
    ) {

        if (!messageEl) {

            return;

        }


        messageEl.hidden =
            false;

        messageEl.textContent =
            text;

        messageEl.className =
            "checkout-message " +
            type;

    }


    /* =================================================
       CLEAR MESSAGE
    ================================================= */

    function clearMessage() {

        if (!messageEl) {

            return;

        }


        messageEl.hidden =
            true;

        messageEl.textContent =
            "";

        messageEl.className =
            "checkout-message";

    }


    /* =================================================
       FOCUS ELEMENT
    ================================================= */

    function focusElement(
        element
    ) {

        if (element) {

            element.focus();

        }

    }

});