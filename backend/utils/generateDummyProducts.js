import productModel from "../models/productModel.js";


const categories = ["Men", "Women", "Kids"];
const subCategories = ["Topwear", "Bottomwear", "Winterwear"];

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDummyProducts = async (req, res, next) => {
  try {
    const TOTAL = Number(req.query.count) || 1000; // you control size

    // ONE STATIC IMAGE 
    const dummyImage = [
      "https://res.cloudinary.com/desphxwgn/image/upload/v1769942590/oaqbchlvckfjwnjmfrbd.png"
    ];

    const products = [];

    for (let i = 0; i < TOTAL; i++) {
      products.push({
        name: `Product ${i + 1}`,
        description: `This is a dummy product ${i + 1}`,
        price: Math.floor(Math.random() * 5000) + 100,
        category: randomFromArray(categories),
        subCategory: randomFromArray(subCategories),
        bestseller: Math.random() > 0.7,
        sizes: ["S", "M", "L"],
        image: dummyImage,
        date: Date.now(),
      });
    }

    // BULK INSERT 
    await productModel.insertMany(products);

    res.json({
      success: true,
      message: `${TOTAL} dummy products inserted`,
    });
  } catch (error) {
    next(error);
  }
};
export default generateDummyProducts;