const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
    quantity: {
      type: Number,
      required: false
    },
    priceSell: {
      type: Number,
      required: false
    },
    date: {
      type: Date,
      default: Date.now
    },
    interest: {
      type: Number,
      required: false
    },
    customPriceSell: {
      type: Number,
      required: false
    },
    profit: {
      type: Number,
      required: false
    },
    storname: {
      type: String,
      required: false
    },
});

transactionSchema.methods.calculateInterestAndProfit = function(priceBuy, priceSell, quantity) {
    const totalBuyCost = priceBuy * quantity;
    const totalSellCost = priceSell * quantity;
    const profit = totalSellCost - totalBuyCost;
    const interest = (profit / totalBuyCost) * 100; // returns interest as a percentage

    return {
        profit,
        interest
    };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
