const router = require("express").Router();
const {
  addProduct,
  getAllProduct,
  editProductById,
  editProduct,
  deleteProduct,
  filteredProducts,
  addProductToCart,
  removeProductFromCart,
} = require("../controllers/product.controller");

// Product
router.get("/products/category", filteredProducts);
router.post("/products", addProduct);
router.post("/products/:productId", editProduct);
router.delete("/products/:productId", deleteProduct);
router.put("/products/:productId", editProductById);
router.get("/products", getAllProduct);

// Cart
router.post("/cart/add", addProductToCart);
router.post("/cart/remove", removeProductFromCart);

module.exports = router;
