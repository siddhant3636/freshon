import userModel from "../models/userModel.js";

// add products to user cart
const addToCart = async (req, res, next ) => {
  try {

    const { itemId, size } = req.body
    const userId =req.user.id;


    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1
      }
      else {
        cartData[itemId][size] = 1
      }
    }
    else {
      cartData[itemId] = {}
      cartData[itemId][size] = 1
    }

    await userModel.findByIdAndUpdate(userId, { cartData })

    res.json({ success: true, message: "Added To Cart" })

  } catch (error) {
    next(error);
  }
}


// update user cart

const updateCart = async (req, res, next ) => {
  try {

    const { itemId, size, quantity } = req.body
    const userId =req.user.id;

    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;

    cartData[itemId][size] = quantity

    await userModel.findByIdAndUpdate(userId, { cartData })

    res.json({ success: true, message: "Cart Updated" })

  } catch (error) {
    next(error);
  }
}





// get user cart data
const getUserCart = async (req, res, next ) => {
  try {

    const userId =req.user.id;

    

    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;
    

    res.json({ success: true, cartData })

  } catch (error) {
    next(error);
  }
}







export {addToCart,updateCart,getUserCart}
