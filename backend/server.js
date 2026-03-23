import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import errorHandler from "./middleware/errorHandler.js";
import redisRateLimiter from "./middleware/rateLimit.js";

// App Config 
const app= express();
const port =process.env.PORT || 4000 ;
connectDB();
connectCloudinary();





//middlewares
app.use(express.json());
app.use(cors());

// api endpoints

app.use("/api/", redisRateLimiter); //Rate Limit ( 100/15  mins ) 

app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);

app.use(errorHandler);
app.get('/',(req,res)=>{res.send("Api working")});


app.listen(port,console.log(`Server Started on Port: ${port} `));

