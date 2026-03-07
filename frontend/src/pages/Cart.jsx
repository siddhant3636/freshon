import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import CartTotal from '../components/CartTotal'
import { toast } from 'react-toastify'

const Cart = () => {

  const { currency, cartItems, updateQuantity, navigate, backendUrl } =
    useContext(ShopContext);

  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart product details
  useEffect(() => {

    const fetchCartProducts = async () => {
      try {

        const ids = Object.keys(cartItems);

        if (ids.length === 0) {
          setCartProducts([]);
          return;
        }

        setLoading(true);

        const response = await axios.post(
          backendUrl + "/api/product/cart-products",
          { ids }
        );

        if (response.data.success) {
          setCartProducts(response.data.data);
        }

      } catch (error) {
        console.error(error);
        toast.error("Failed to load cart products");
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();

  }, [cartItems]);



  // Flatten cart structure
  const cartData = [];

  for (const productId in cartItems) {
    for (const size in cartItems[productId]) {

      if (cartItems[productId][size] > 0) {

        cartData.push({
          _id: productId,
          size: size,
          quantity: cartItems[productId][size]
        });

      }
    }
  }


  let cartItemsDetailed;
  if(cartProducts.length>0)
  {

  
  // Create fast lookup map
  const productMap = Object.fromEntries(
    cartProducts.map(product => [product._id, product])
  );



  // Merge cart info with product info
     cartItemsDetailed = cartData
    .map(item => {

      const product = productMap[item._id];

      if (!product) {
        console.warn("Missing product for id:", item._id);
        return null;
      }

      return {
        ...product,
        ...item
      };

    })
    .filter(Boolean);
  }



  return (
    <div className='border-t pt-14'>

      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>


      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      )}



      {/* Cart Items */}
      <div>

        {cartItemsDetailed && cartItemsDetailed.map((productData) => {

          if (!productData) return null;

          return (
            <div
              key={`${productData._id}-${productData.size}`}
              className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >

              <div className='flex items-start gap-6'>

                <img
                  className='w-16 sm:w-20'
                  src={productData?.image?.[0]}
                  alt=""
                />

                <div>

                  <p className='text-xs sm:text-lg font-medium'>
                    {productData.name}
                  </p>

                  <div className='flex items-center gap-5 mt-2'>

                    <p>{currency}{productData.price}</p>

                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>
                      {productData.size}
                    </p>

                  </div>

                </div>

              </div>


              {/* Quantity Input */}
              <input
                onChange={(e) =>
                  e.target.value === '' || e.target.value === '0'
                    ? null
                    : updateQuantity(
                        productData._id,
                        productData.size,
                        Number(e.target.value)
                      )
                }
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                type="number"
                min={1}
                value={productData.quantity}
              />


              {/* Remove Item */}
              <img
                onClick={() =>
                  updateQuantity(productData._id, productData.size, 0)
                }
                className='w-4 mr-4 sm:w-5 cursor-pointer'
                src={assets.bin_icon}
                alt=""
              />

            </div>
          );
        })}

      </div>



      {/* Cart Total */}
      <div className='flex justify-end my-20'>

        <div className='w-full sm:w-[450px]'>

          <CartTotal />

          <div className='w-full text-end'>

            <button
              onClick={() => navigate('/place-order')}
              className='bg-black text-white text-sm my-8 px-8 py-3'
            >
              PROCEED TO CHECKOUT
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Cart