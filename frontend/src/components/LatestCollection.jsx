import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem';
import axios from 'axios';


const LatestCollection = () => {

  const {backendUrl} =useContext(ShopContext);

  const [latestProduct,setLatestProduct]=useState([]);
  useEffect(()=>{
  const fetchLatestProduct = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list?sort=newest&limit=10`)

        if (response.data.success) {
          setLatestProduct(response.data.data)
        }
        
      } catch (error) {
        console.error("Latest products fetch error:", error)
      }
    }
    fetchLatestProduct()
  },[backendUrl]);



  return (
    <div className='my-10' >
      <div className='text-center py-8 text-3xl' >
        <Title text1={'LATEST'} text2={'COLLECTIONS'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        </p>
      </div>

        {/* Rendering  Products */}

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6' >
        {latestProduct && latestProduct.map( (product,index)=> <ProductItem key={product._id} id={product._id} image={product.image} name={product.name} price={product.price}/>)}
        </div>



    </div>
  )
}

export default LatestCollection

