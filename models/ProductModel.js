const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },

    created_at: Date,
})

const product = mongoose.model('products', ProductSchema);
module.exports = product;
