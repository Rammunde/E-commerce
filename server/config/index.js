const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    PORTAL_NAME: process.env.PORTAL_NAME || "Shopveda",
    PORT: process.env.PORT || 5000,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    MONGODB_ATLAS_VECTOR_INDEX: process.env.MONGODB_ATLAS_VECTOR_INDEX || "vector_index",
    LOCAL_EMBEDDING_MODEL: process.env.LOCAL_EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
};

