import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import redis from "../config/redis.js";
import productModel from "../models/productModel.js";
import { buildProductQuery } from "../utils/buildProductQuery.js";
import { buildSortOption } from "../utils/buildSortOption.js";

const PRODUCT_TTL = 60 * 60; // 1 hour
const LIST_TTL = 5 * 60; // 5 minutes
const RELATED_TTL = 10 * 60; // 10 minutes
const LIST_VERSION_KEY = "products:list:version";

const getListVersion = async () => {
  const v = await redis.get(LIST_VERSION_KEY);
  return v || "1";
};

const bumpListVersion = async () => {
  await redis.incr(LIST_VERSION_KEY);
};

const normalizeListQuery = (query = {}) => {
  const {
    limit = 10,
    cursor = "",
    sort = "",
    category = "",
    subCategory = "",
    bestseller = "",
    q = ""
  } = query;

  return {
    limit: String(limit),
    cursor: String(cursor),
    sort: String(sort),
    category: String(category),
    subCategory: String(subCategory),
    bestseller: String(bestseller),
    q: String(q)
  };
};

const buildListCacheKey = async (req) => {
  const version = await getListVersion();
  const normalized = normalizeListQuery(req.query);
  return `products:list:v${version}:${JSON.stringify(normalized)}`;
};

const parseCursor = (cursor, sort) => {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    if (sort === "low_high" || sort === "high_low") {
      return null;
    }
    return { _id: cursor };
  }
};

const buildQueryWithCursor = (reqQuery) => {
  const { cursor, sort } = reqQuery;

  const query = buildProductQuery(reqQuery);
  const cursorObj = parseCursor(cursor, sort);

  if (!cursorObj) return query;

  if (sort === "low_high" || sort === "high_low") {
    if (cursorObj.price === undefined || !cursorObj._id) {
      const error = new Error("Invalid cursor for price-based pagination");
      error.statusCode = 400;
      throw error;
    }

    const priceNumber = Number(cursorObj.price);
    if (Number.isNaN(priceNumber)) {
      const error = new Error("Invalid price in cursor");
      error.statusCode = 400;
      throw error;
    }

    const oid = new mongoose.Types.ObjectId(cursorObj._id);

    if (sort === "low_high") {
      query.$or = [
        { price: { $gt: priceNumber } },
        { price: priceNumber, _id: { $gt: oid } }
      ];
    } else {
      query.$or = [
        { price: { $lt: priceNumber } },
        { price: priceNumber, _id: { $lt: oid } }
      ];
    }
  } else {
    const idToUse = cursorObj._id || cursorObj.id || cursor;
    if (!mongoose.Types.ObjectId.isValid(idToUse)) {
      const error = new Error("Invalid cursor id");
      error.statusCode = 400;
      throw error;
    }

    query._id = { $lt: new mongoose.Types.ObjectId(idToUse) };
  }

  return query;
};

const getProductsByIdsCached = async (ids) => {
  if (!ids.length) return [];

  const productKeys = ids.map((id) => `product:${id}`);
  const cachedProducts = await redis.mget(productKeys);

  const productsMap = new Map();

  cachedProducts.forEach((item, index) => {
    if (item) {
      productsMap.set(ids[index], JSON.parse(item));
    }
  });

  const missingIds = ids.filter((id) => !productsMap.has(id));

  if (missingIds.length > 0) {
    const missingProducts = await productModel
      .find({ _id: { $in: missingIds } })
      .lean();

    for (const product of missingProducts) {
      const pid = String(product._id);
      productsMap.set(pid, product);
      await redis.set(`product:${pid}`, JSON.stringify(product), "EX", PRODUCT_TTL);
    }
  }

  return ids.map((id) => productsMap.get(id)).filter(Boolean);
};

// function for add Product
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now()
    };

    const product = new productModel(productData);
    await product.save();

    const plainProduct = product.toObject();
    await redis.set(`product:${plainProduct._id}`, JSON.stringify(plainProduct), "EX", PRODUCT_TTL);
    await bumpListVersion();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    next(error);
  }
};

// listProducts
const listProducts = async (req, res, next) => {
  try {
    const { limit = 10, cursor, sort } = req.query;

    const limitNum = Math.max(1, Math.min(100, Number(limit)));

    //  1. FILTER KEY (NO cursor)
    const baseQuery = buildProductQuery(req.query);
    const sortOption = buildSortOption(sort);

    const listKey =
      "products:list:v1:" +
      JSON.stringify({ query: baseQuery, sort });

    //  2. GET ID LIST FROM REDIS
    let idList = await redis.get(listKey);

    if (idList) {
      idList = JSON.parse(idList);
      res.set("X-Cache", "HIT-LIST");
    } else {
      res.set("X-Cache", "MISS-LIST");

      const products = await productModel
        .find(baseQuery)
        .sort(sortOption)
        .select("_id price") // keep minimal for sort consistency
        .lean();

      idList = products.map(p => ({
        _id: String(p._id),
        price: p.price,
      }));

      await redis.set(listKey, JSON.stringify(idList), "EX", 300);
    }

    //  3. FIND START INDEX USING CURSOR
    let startIndex = 0;

    if (cursor) {
      let cursorObj;
      try {
        const decoded = Buffer.from(cursor, "base64").toString("utf-8");
        cursorObj = JSON.parse(decoded);
      } catch {
        cursorObj = { _id: cursor };
      }

      startIndex = idList.findIndex(item => {
        if (sort === "low_high" || sort === "high_low") {
          return (
            item._id === cursorObj._id &&
            Number(item.price) === Number(cursorObj.price)
          );
        }
        return item._id === cursorObj._id;
      });

      if (startIndex !== -1) startIndex += 1;
      else startIndex = 0;
    }

    //  4. SLICE IDS
    const slice = idList.slice(startIndex, startIndex + limitNum);

    const ids = slice.map(i => i._id);

    //  5. PIPELINE FETCH PRODUCTS
    const pipeline = redis.pipeline();

    ids.forEach(id => {
      pipeline.get(`product:${id}`);
    });

    const results = await pipeline.exec();

    let products = [];
    let missingIds = [];

    results.forEach(([err, data], index) => {
      if (data) {
        products.push(JSON.parse(data));
      } else {
        missingIds.push(ids[index]);
      }
    });

    //  6. FETCH MISSING FROM DB
    if (missingIds.length > 0) {
      const dbProducts = await productModel
        .find({ _id: { $in: missingIds } })
        .lean();

      const setPipeline = redis.pipeline();

      dbProducts.forEach(p => {
        setPipeline.set(
          `product:${p._id}`,
          JSON.stringify(p),
          "EX",
          600
        );
      });

      await setPipeline.exec();

      products = [...products, ...dbProducts];
    }

    //  7. MAINTAIN ORDER (IMPORTANT)
    const productMap = new Map();
    products.forEach(p => {
      productMap.set(String(p._id), p);
    });

    const orderedProducts = ids
      .map(id => productMap.get(id))
      .filter(Boolean);

    //  8. NEXT CURSOR
    let nextCursor = null;

    if (slice.length > 0) {
      const last = slice[slice.length - 1];

      const cursorPayload =
        sort === "low_high" || sort === "high_low"
          ? { price: last.price, _id: last._id }
          : { _id: last._id };

      nextCursor = Buffer.from(
        JSON.stringify(cursorPayload)
      ).toString("base64");
    }

    //  9. TOTAL COUNT (optional cache later)
    const totalCount = await productModel.countDocuments(baseQuery);

    return res.status(200).json({
      success: true,
      data: orderedProducts,
      count: orderedProducts.length,
      totalCount,
      nextCursor,
    });

  } catch (error) {
    next(error);
  }
};



// function for listing all Product
const listAllProducts = async (req, res, next) => {
  try {
    const version = await getListVersion();
    const listKey = `products:all:v${version}`;

    const cached = await redis.get(listKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const products = await getProductsByIdsCached(parsed.ids);

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length
      });
    }

    const products = await productModel.find().lean();
    const ids = products.map((p) => String(p._id));

    const pipeline = redis.pipeline();
    for (const product of products) {
      pipeline.set(`product:${product._id}`, JSON.stringify(product), "EX", PRODUCT_TTL);
    }

    pipeline.set(listKey, JSON.stringify({ ids }), "EX", LIST_TTL);
    await pipeline.exec();

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// function for removing Product
const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    const deleted = await productModel.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    await redis.del(`product:${id}`);
    await bumpListVersion();

    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    next(error);
  }
};

// function for single Product
const singleProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    const key = `product:${productId}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.status(200).json({
        success: true,
        product: JSON.parse(cached)
      });
    }

    const product = await productModel.findById(productId).lean();

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    await redis.set(key, JSON.stringify(product), "EX", PRODUCT_TTL);

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// list 5 related products
const relatedProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }

    const version = await getListVersion();
    const cacheKey = `related:v${version}:${productId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({ success: true, related: JSON.parse(cached) });
    }

    const product = await productModel.findById(productId).lean();

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const related = await productModel.find({
      category: product.category,
      subCategory: product.subCategory,
      _id: { $ne: productId }
    }).limit(5).lean();

    await redis.set(cacheKey, JSON.stringify(related), "EX", RELATED_TTL);

    res.json({ success: true, related });
  } catch (error) {
    next(error);
  }
};

const getCartProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Product IDs are required");
      error.statusCode = 400;
      throw error;
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      const error = new Error("No valid product IDs provided");
      error.statusCode = 400;
      throw error;
    }

    const products = await getProductsByIdsCached(validIds);

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  relatedProducts,
  getCartProducts,
  listAllProducts
};