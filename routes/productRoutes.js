const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

//const verifyJWT = require('../middleware/verifyJWT')

//router.use(verifyJWT)
router.post('/add', productController.addProduct);
router.post('/sell', productController.createTransaction);
router.post('/sellOil', productController.createOilTransaction);
router.post('/buy', productController.buyProduct);
router.get('/list', productController.listAllProducts);
router.get('/list2', productController.listAllProducts2);
router.get('/lists1', productController.listAllSells1);
router.get('/lists2', productController.listAllSells2);
// New routes
router.put('/editProduct/:productId', productController.editProduct); // Update product
router.delete('/deleteProduct/:productId', productController.deleteProduct); // Delete product

router.delete('/deletetransactions', productController.deleteTransactions); // Delete product


// Route to edit a transaction
router.put('/transactions/:transactionId', productController.editTransaction);

// Route to delete a transaction
router.delete('/transactions/:transactionId', productController.deleteTransaction);

// Route to get a product by productId
router.get('/product/:productId', productController.getProduct);
module.exports = router;
