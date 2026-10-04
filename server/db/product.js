const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    userId: {
        type: String,
    },
    company: {
        type: String,
    },
    productDescription: {
        type: String,
    },
    productImages: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        default: "",
    },
    brand: {
        type: String,
        default: "",
    },
    tags: {
        type: [String],
        default: [],
    },
    searchableText: {
        type: String,
        default: "",
    },
    embedding: {
        type: [Number],
        default: [],
    },
    embeddingVersion: {
        type: String,
        default: "2.0",
    },
    embeddingModel: {
        type: String,
        default: "",
    },
    embeddingUpdatedAt: {
        type: Date,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("products", productSchema);