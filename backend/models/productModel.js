import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true ,min: 0},
  image: { type: [String],required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: [{ type: String,enum: ["S", "M", "L", "XL", "XXL"]}],  
  bestseller: { type: Boolean, default: false },
},{ timestamps: true });

// Indexes for performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1, _id: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text" });


const ProductModel = mongoose.models.Product ||  mongoose.model("Product", productSchema);



export default ProductModel;
