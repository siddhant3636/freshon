import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';


//global variable
const currency = 'usd'
const deliveryCharge = 10;


//gateway initialised
const stripe =new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET,
});



// Placing Orders using COD Method
const placeOrder = async (req, res, next) => {
  try {

    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod:"COD",
      payment: false,
      date: Date.now()
    };     
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });

  } catch (error) {
   next(error);
}
};


// All Orders data for Admin
const allOrders = async (req, res, next) => {

    try {
      const orders= await orderModel.find({});
      res.json({success:true,orders});
    } catch (error) {
      next(error);
    }
}


// User Orders data for Frontend
const userOrders = async (req, res, next) => {
    try {
      const { userId } = req.body;
  
      const orders= (await orderModel.find({userId}).sort({_id:-1}));
  
      res.json({success:true,orders});
      
    } catch (error) {
      next(error);
        
    }
}


// Placing Orders using Stripe Method
const placeOrderStripe = async (req, res, next) => {
  
    try {

    const { userId, items, amount, address } = req.body;
    const {origin} = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod:"Stripe",
      payment: false,
      date: Date.now()
    };     
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
    
     price_data: {
        currency: currency,
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));
    
    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: deliveryCharge * 100
      },
      quantity: 1
    });

    const session =await stripe.checkout.sessions.create({
     success_url:`${origin}/verify?sucess=true&orderId=${newOrder._id}`,
     cancel_url:`${origin}/verify?sucess=true&orderId=${newOrder._id}`,
     line_items,
     mode: 'payment',
    })

    
    

    res.json({ success: true, session_url: session.url });

  } catch (error) {
   next(error);
}

}

// Verify Stripe
const verifyStripe = async (req, res, next) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
   next(error);
  }
};


// Placing Orders using Razorpay Method
const placeOrderRazorpay = async (req, res, next) => {
   try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod:"Razorpay",
      payment: false,
      date: Date.now()
    };     
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options ={
      amount:amount*100,
      currency:currency.toUpperCase(),
      receipt:newOrder._id.toString()

    }
    razorpayInstance.orders.create(options, (error, order) => {
       if(error) {
         console.log(error);
         return res.json({ success: false, message: error });
       }
       res.json({ success: true, order });
     })

   } catch (error) {
   next(error);
  }
}


// Verify Razorpay
const verifyRazorpay = async (req, res, next) => {
  try {
    const { userId ,razorpay_order_id }=req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    
    if(orderInfo.status ==='paid')
      {
        await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
        await userModel.findByIdAndUpdate(userId,{cartData:{}});
        res.json({ success: true, message: "Payment Successfull" });
      }else{

        res.json({ success: false, message: "Payment Failed" });
      }
    } catch (error) {
      next(error);
    }



}

//update order status from Admin Panel
const updateStatus = async (req, res, next) => {
    
    try {
      const {orderId, status} = req.body;
      await orderModel.findByIdAndUpdate(orderId,{status})
      res.json({success:true,message:'Status Updated'});
      
    } catch (error) {
        next(error);
    }
}




export {verifyRazorpay,verifyStripe,placeOrder,userOrders,placeOrderStripe,placeOrderRazorpay,allOrders,updateStatus};
