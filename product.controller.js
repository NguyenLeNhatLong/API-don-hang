const Product = require("../models/product");
const User = require("../models/user");
const CartItem = require("../models/cartItemProduct");
const Joi = require("joi");
const mongoose = require("mongoose");

const addProduct = async (req, res) => {
  try {
    // Define validation schema for the product data
    const schema = Joi.object({
      productName: Joi.string().required(),
      imgUrl: Joi.string().uri().required(),
      category: Joi.string().required(),
      onSale: Joi.boolean().required(),
      price: Joi.number().required(),
      shortDesc: Joi.string().required(),
      description: Joi.string().required(),
    });

    // Validate the request body against the schema
    const { error, value } = schema.validate(req.body);

    // If validation fails, send an error response
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Create a new product with validated data
    const newProduct = new Product(value);

    // Save the product to the database
    const savedProduct = await newProduct.save();
    console.log("Save successfully");
    // Send a success response with the saved product
    res.status(201).json(savedProduct);
  } catch (error) {
    // Handle server errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  console.log(productId);
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json("Product not found");
    }
    res.status(200).json("Product deleted successfully");
  } catch (error) {
    res.status(500).json("Failed to delete product");
  }
};

const editProduct = async (req, res) => {
  const { productId } = req.params;
  console.log(productId);
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }
    res.status(200).json(product);
  } catch (err) {
    throw err;
  }
};

const editProductById = async (req, res) => {
  const { productId } = req.params;
  const {
    productName,
    imgUrl,
    category,
    onSale,
    price,
    shortDesc,
    description,
  } = req.body;

  try {
    if (
      !productName ||
      !imgUrl ||
      !category ||
      typeof onSale !== "boolean" ||
      isNaN(price) ||
      !shortDesc ||
      !description
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or missing fields in the request body" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productName,
        imgUrl,
        category,
        onSale,
        price,
        shortDesc,
        description,
      },
      { new: true }
    ); // Update and return new document
    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    console.log("Edit successfully");
    res.status(200).json(updatedProduct);
  } catch (err) {
    throw err;
  }
};

const getAllProduct = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm từ cơ sở dữ liệu
    const allProducts = await Product.find();
    res.status(200).json(allProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filteredProducts = async (req, res) => {
  try {
    const { category } = req.query;

    // Validate if category is present and is a non-empty string
    if (!category || typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({ error: "Invalid category parameter" });
    }

    const categoryProducts = await Product.find({ category: category });

    res.status(200).json(categoryProducts);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addProductToCart = async (req, res) => {
  try {
    // Find the user's cart
    const { userId, products } = req.body;
    const { quantity, productId } = products;
    let cartItem = await CartItem.findOne({ user: userId });

    if (!cartItem) {
      // If the user's cart doesn't exist, create a new one
      cartItem = new CartItem({
        user: userId,
        products: [],
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }
    const existingProductIndex = cartItem.products.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (existingProductIndex !== -1) {
      cartItem.products[existingProductIndex].quantity += quantity;
    } else {
      cartItem.products.push({
        productId: productId,
        quantity: quantity,
        productName: product.productName,
        imgUrl: product.imgUrl,
        category: product.category,
        onSale: product.onSale,
        price: product.price,
        shortDesc: product.shortDesc,
        description: product.description,
        avgRating: product.avgRating,
        show: product.show,
        reviews: product.reviews,
      });
    }

    // Save the updated cartItem to the database
    await cartItem.save();

    // Return the updated cartItem along with a success message
    return res.json({
      message: "Product added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeProductFromCart = async (req, res) => {
  const { userId, products } = req.body;
  const { quantity, productId } = products;
  try {
    let cartItem = await CartItem.findOne({ user: userId });

    if (!cartItem) {
      throw new Error("User cart not found");
    }

    const existingProductIndex = cartItem.products.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (existingProductIndex !== -1) {
      const newQuantity =
        cartItem.products[existingProductIndex].quantity - quantity;

      if (newQuantity <= 0) {
        // If the new quantity is less than or equal to 0, remove the product from the cart
        cartItem.products.splice(existingProductIndex, 1);
      } else {
        // Otherwise, update the quantity
        cartItem.products[existingProductIndex].quantity = newQuantity;
      }

      // Save the updated cartItem to the database
      await cartItem.save();
    } else {
      throw new Error("Product not found in cart");
    }

    return res.json({
      cartItem,
      message: "Product quantity updated successfully",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  addProduct,
  getAllProduct,
  deleteProduct,
  editProductById,
  editProduct,
  filteredProducts,
  addProductToCart,
  removeProductFromCart,
};
