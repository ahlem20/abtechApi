const Product = require('../models/Products');
const Transaction = require('../models/Transaction');
// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { productId, name, quantity, priceBuy, priceSell, storname,description } = req.body;

    // Check if a product with the same productId and storname already exists
    const existingProduct = await Product.findOne({ productId, storname });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product with the same ID already exists in this store' });
    }

    // If no existing product, create and save the new product
    const product = new Product({ productId, name, quantity, priceBuy, priceSell, storname,description });
    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(400).json({ message: 'Error adding product', error });
  }
};


// Sell Product
exports.createTransaction = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    // Calculate interest
    const interest = new Transaction().calculateInterest(product.priceBuy, product.priceSell, quantity);

    // Create and save transaction
    const transaction = new Transaction({
      productId: product._id,
      quantity,
      priceSell: product.priceSell,
      interest
    });

    await transaction.save();

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    res.status(200).json({ message: 'Product sold successfully', product, transaction });
  } catch (error) {
    res.status(400).json({ message: 'Error selling product', error });
  }
};

// Buy Product
exports.buyProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ productId });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.quantity += quantity;
    await product.save();

    res.status(200).json({ message: 'Product bought successfully', product });
  } catch (error) {
    res.status(400).json({ message: 'Error buying product', error });
  }
};
// List All Products where storname = "stor1"
exports.listAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ storname: "stor1" }); // Filter by storname
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching products', error });
  }
};

// List All Products where storname != "stor1"
exports.listAllProducts2 = async (req, res) => {
  try {
    const products = await Product.find({ storname: { $ne: "stor1" } }); // Filter where storname is not "stor1"
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching products', error });
  }
};


// Get a single product by productId
exports.getProduct = async (req, res) => {
  try {
    const { productId,storname } = req.params;
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
// Sell Product (modified)
exports.createTransaction = async (req, res) => {
  try {
    const { productId, quantity, customPriceSell } = req.body;
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    // Determine the selling price to use
    const priceSell = customPriceSell || product.priceSell;

    // Calculate interest and profit
    const { profit, interest } = new Transaction().calculateInterestAndProfit(product.priceBuy, priceSell, quantity);

    // Create and save transaction
    const transaction = new Transaction({
      productId: product._id,
      storname: product.storname,
      quantity,
      priceSell,
      interest,
      profit
    });

    await transaction.save();

    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.listAllSells1 = async (req, res) => {
  try {
    // Find transactions where the referenced product's storname is "stor1"
    const transactions = await Transaction.find()
      .populate({
        path: 'productId',
        match: { storname: "stor1" }
      });

    // Filter out transactions where productId is null (i.e., not matching the storname)
    const filteredTransactions = transactions.filter(transaction => transaction.productId);

    res.status(200).json(filteredTransactions);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching transactions', error });
  }
};

exports.listAllSells2 = async (req, res) => {
  try {
    // Find transactions where the referenced product's storname is "stor1"
    const transactions = await Transaction.find()
      .populate({
        path: 'productId',
        match: { storname: "stor2" }
      });

    // Filter out transactions where productId is null (i.e., not matching the storname)
    const filteredTransactions = transactions.filter(transaction => transaction.productId);

    res.status(200).json(filteredTransactions);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching transactions', error });
  }
};

// Sell Product (unchanged)
exports.createOilTransaction = async (req, res) => {
  try {
    const { productId, profit,quantity,priceSell, interest } = req.body;
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    const transaction = new Transaction({
      productId: product._id,
      quantity,
      priceSell,
      interest,
      profit
    });

    await transaction.save();

    res.status(200).json({ message: 'Product sold successfully', product, transaction });
  } catch (error) {
    res.status(400).json({ message: 'Error selling product', error });
  }
};
// Edit Product
exports.editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, quantity, priceBuy, priceSell, storname } = req.body;

    // Find the product by productId
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update the product details
    product.name = name !== undefined ? name : product.name;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.priceBuy = priceBuy !== undefined ? priceBuy : product.priceBuy;
    product.priceSell = priceSell !== undefined ? priceSell : product.priceSell;
    product.storname = storname !== undefined ? storname : product.storname;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
};
// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product by productId
    const product = await Product.findOne({ productId });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete the product
    await Product.deleteOne({ productId });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error });
  }
};

// Edit Transaction
exports.editTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { productId, quantity, priceSell, interest, profit, storname, date } = req.body;

    // Find the transaction by transactionId
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Update the transaction details
    transaction.productId = productId !== undefined ? productId : transaction.productId;
    transaction.quantity = quantity !== undefined ? quantity : transaction.quantity;
    transaction.priceSell = priceSell !== undefined ? priceSell : transaction.priceSell;
    transaction.interest = interest !== undefined ? interest : transaction.interest;
    transaction.profit = profit !== undefined ? profit : transaction.profit;
    transaction.storname = storname !== undefined ? storname : transaction.storname;
    transaction.date = date !== undefined ? date : transaction.date;

    // Save the updated transaction
    await transaction.save();

    res.status(200).json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction', error });
  }
};
// Delete Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction by transactionId
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Delete the transaction
    await Transaction.deleteOne({ _id: transactionId });

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting transaction', error });
  }
};

// Delete All Transactions
exports.deleteTransactions = async (req, res) => {
  try {
    // Delete all transactions
    await Transaction.deleteMany({});

    res.status(200).json({ message: 'All transactions deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting transactions', error });
  }
};
