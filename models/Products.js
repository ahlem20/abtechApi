const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  storname: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  priceBuy: {
    type: Number,
    required: false
  },
  priceSell: {
    type: Number,
    required: false
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
