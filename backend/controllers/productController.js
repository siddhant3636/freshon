import {v2 as cloudinary} from "cloudinary";
import productModel from "../models/productModel.js";
import { buildProductQuery } from "../utils/buildProductQuery.js";
import { buildSortOption } from "../utils/buildSortOption.js";
import mongoose from "mongoose";



// function for add Product
const addProduct = async (req, res,next) => {

  try {

    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
    
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    
    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
    
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
     return result.secure_url;
    })
  );
  
  
  const productData = {
    name,
    description,
    category,
    price: Number(price),
    subCategory,
    bestseller: bestseller === "true" ? true : false,
    sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now()
    }
    const product =new productModel(productData);
    
    await product.save();
    res.json({success:true ,message:"Product Added"});
    
    
    
    
  } catch (error) {
    next(error);
  }
}

// function for list Product
const listProducts = async (req, res, next) => {
  
  try {
    
    const { limit = 10, cursor, sort } = req.query;

    if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
      const error = new Error("Invalid cursor");
      error.statusCode = 400;
      throw error;
    }

    const query = buildProductQuery(req.query);
    const sortOption = buildSortOption(sort);

    const [products, totalCount] = await Promise.all([
      productModel
        .find(query)
        .sort(sortOption)
        .limit(Number(limit))
        .lean(),

      productModel.countDocuments(query)
    ]);
    
    return res.status(200).json({
      success: true,
      totalCount,
      count: products.length,
      data: products,
      nextCursor: products.length
        ? products[products.length - 1]._id
        : null
    });
    

  } catch (error) {
    next(error);
  }
};


// function for listing all  Product
const listAllProducts = async (req, res ,next ) => {
    try{
        const data=await productModel.find();
        res.json({success:"true",data});
    }catch (error) {
    next(error);
    }
 

}

// function for removing Product
const removeProduct = async (req, res,next) => {
    try{
        await productModel.findByIdAndDelete(req.body.id);
        res.json({success:"true",message:"Product Removed"});
    }catch (error) {
    next(error);
    }
 

}

// function for single Product
const singleProduct = async (req, res,next) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
      
    }

    const product = await productModel
      .findById(productId)
      .lean();

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    next(error);
  }
};  


//list 5 related products 
const relatedProducts = async (req, res,next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
      
    }

    const product = await productModel.findById(productId).lean();

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 400;
      throw error;
    }

    const related = await productModel.find({
      category: product.category,
      subCategory: product.subCategory,
      _id: { $ne: productId } // exclude current product
    }).limit(5).lean();

    res.json({ success: true, related });

  } catch (error) {
    next(error);
  }
};



const getCartProducts = async (req, res,next) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Product IDs are required");
      error.statusCode = 400;
      throw error;
    }

    // Validate all IDs
    const validIds = ids.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      const error = new Error("No valid product IDs provided");
      error.statusCode = 400;
      throw error;
    }

    // Fetch products
    const products = await productModel
      .find({ _id: { $in: validIds } })
      .lean();

    return res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
   next(error);
    
  }
};


export {listProducts,addProduct,removeProduct,singleProduct,relatedProducts,getCartProducts,listAllProducts};





















