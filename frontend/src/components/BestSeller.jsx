import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import axios from 'axios'
import { toast } from 'react-toastify'

const BestSeller = () => {

  const { backendUrl } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/product/list?bestseller=true&limit=5`
        );

        if (response.data.success) {
          setBestSeller(response.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load bestseller products");
      }
    };

    fetchBestSeller();
  }, [backendUrl]);

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {bestSeller.map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  )
}

export default BestSeller