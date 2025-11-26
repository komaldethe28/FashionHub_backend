import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    subCategory: { type: String, required: true },
    bestseller: { type: Boolean },
    sizes: { type: Array, required: true },
    images: { type: Array, required: true },
    date: { type: Number, required: true }
})

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel