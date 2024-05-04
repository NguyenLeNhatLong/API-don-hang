const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: String,
      imgUrl: String,
      category: String,
      onSale: Boolean,
      price: Number,
      shortDesc: String,
      description: String,
      avgRating: Number,
      show: Boolean,
      reviews: Array,
      quantity: {
        type: Number,
        required: true,
        default: 1, // Default quantity is 1
      },
    },
  ],
});

module.exports = mongoose.model("CartItem", cartItemSchema);
