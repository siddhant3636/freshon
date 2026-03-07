import React, { use, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';


const Product = () => {
  
  const {productId}=useParams();
  const { currency, addToCart, backendUrl } = useContext(ShopContext);  
  const [productData,setProductData] =useState(false);
  const [image,setImage]=useState('');
  const [size,setSize]=useState('');

  
 const fetchProductData = async () => {
  try {
    const response = await axios.post(
      backendUrl + "/api/product/single",
      { productId }
    );

    if (response.data.success) {
      const product = response.data.product;
      setProductData(product);
      setImage(product.image[0]);
    }

    } catch (error) {
     console.log(error);
    }
  };

  useEffect(()=>{
    fetchProductData();
  },[productId]);


  return productData? (
    <div className='border-t-2  pt-10 transition-opacity ease-in duration-500 opacity-100' >  
      {/* Prodcut Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row' >
        
        {/* Product image */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row' >
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full '>
           {
            productData.image.map((item,index)=>(
              <img src={item} key={index} onClick={()=>setImage(item)} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
            ))
           }
          </div>
          <div className='w-full sm:w-[80%]' >
            <img  className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* Product info */}
        <div className='flex-1 ' >
          <h1 className='font-medium text-2xl mt-2' >{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2' >
           <img src={assets.star_icon} className='w-3 5' alt="" />
           <img src={assets.star_icon} className='w-3 5' alt="" />
           <img src={assets.star_icon} className='w-3 5' alt="" />
           <img src={assets.star_icon} className='w-3 5' alt="" />
           <img src={assets.star_dull_icon} className='w-3 5' alt="" />
          <p className='pl-2' >(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium' >{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5' >{productData.description}</p>
          <div className='flex flex-col gap-4 my-8' >
           <p>Select Size</p>
           <div className='flex gap-2' >
            {
              productData.sizes.map((item,index)=>(
                <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item==size ? 'border-orange-500 bg-orange-100':''}`} key={index}>{item}</button>
              ))
            }
           </div>
          </div>
           <button onClick={()=>addToCart(productData._id,size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
           <hr className='mt-8 sm:w-4/5' />
           <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original Product</p>
            <p>Cash on delivery and exchange policy within 7 days.</p>
            <p>Essy return and exchange policy within 7 days.</p>
           </div>
        </div>
      </div>

      {/* Description & Review Section */}

      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm' >Description</b>
          <p className='border px-5 py-3 text-sm' >Reviews(122)</p>
        </div>
      </div>

      <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500' >
       <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
       <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</p>
      </div>



      {/* Display related Products */}
      
      <RelatedProducts productId={productId}/>



    </div>
  ): null
}

export default Product
