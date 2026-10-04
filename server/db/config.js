const URL = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017";
const ECOMMERCE = process.env.ECOMMERCE || "shopveda";
const USERS_DB = "users";
const PRODUCTS = "products";
const ACTIVE_CART = "active_cart";
const ORDERS = "orders";
const REVIEWS = "reviews";
const REVIEW_ANALYSIS = "review_analysis";

module.exports = {
    URL,
    ECOMMERCE,
    USERS_DB,
    PRODUCTS,
    ACTIVE_CART,
    ORDERS,
    REVIEWS,
    REVIEW_ANALYSIS,
};
