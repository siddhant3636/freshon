import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/errorHandler.js";

// App Config 
const app= express();
const port =process.env.PORT || 4000 ;
connectDB();
connectCloudinary();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});


app.set("trust proxy", 1);
//middlewares
app.use(express.json());
app.use(cors());

// api endpoints

app.use("/api/", apiLimiter); //Rate Limit ( 100/15  mins ) 

app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);

app.use(errorHandler);
app.get('/',(req,res)=>{res.send("Api working")});


app.listen(port,console.log(`Server Started on Port: ${port} `));

