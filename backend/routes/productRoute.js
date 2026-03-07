import express from 'express'
import upload  from "../middleware/multer.js";

import { listProducts, addProduct, removeProduct, singleProduct, relatedProducts , getCartProducts,listAllProducts } from '../controllers/productController.js'
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

productRouter.post('/add',adminAuth, upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.get('/listall', listAllProducts);
productRouter.get('/related/:productId', relatedProducts);
productRouter.post("/cart-products", getCartProducts);


export default productRouter;
