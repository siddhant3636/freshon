import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/frontend_assets/assets';
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { toast } from 'react-toastify';

const Collection = () => {

  const { backendUrl } = useContext(ShopContext);
  const [showFilter, setShowFilters] = useState(false);

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // -------------------------
  // Toggle Filters
  // -------------------------

  const toggleCategory = (e) => {
    const value = e.target.value;

    setCategory(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;

    setSubCategory(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // -------------------------
  // Fetch Products
  // -------------------------

  const fetchProducts = async (cursor = null, reset = false) => {
    try {
      setLoading(true);

      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          limit: 8,
          category: category.join(","),
          subCategory: subCategory.join(","),
          sort: sortType,
          cursor
        }
      });

      if (response.data.success) {
        setProducts(prev =>
          reset ? response.data.data : [...prev, ...response.data.data]
        );

        setNextCursor(response.data.nextCursor);
        setTotalCount(response.data.totalCount);
      }

    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Refetch when filters change
  // -------------------------

  useEffect(() => {
    setNextCursor(null);
    fetchProducts(null, true);
  }, [category, subCategory, sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10'>

      {/* Filters */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilters(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        {/* Category */}
        <div className={`border pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          {["Men", "Women", "Kids"].map(item => (
            <label key={item} className='flex gap-2 text-sm'>
              <input
                type="checkbox"
                value={item}
                onChange={toggleCategory}
              />
              {item}
            </label>
          ))}
        </div>

        {/* Type */}
        <div className={`border pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          {["Topwear", "Bottomwear", "Winterwear"].map(item => (
            <label key={item} className='flex gap-2 text-sm'>
              <input
                type="checkbox"
                value={item}
                onChange={toggleSubCategory}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTION'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border px-2 text-sm'
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low_high">Sort by: Low to High</option>
            <option value="high_low">Sort by: High to Low</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {totalCount} Products Found
        </p>

        {/* Loading Skeleton */}
        {loading && products.length === 0 && ( 
        <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>        )}

        {/* Product Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {products.map(item => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              price={item.price}
              name={item.name}
            />
          ))}
        </div>

        {/* Load More */}
        {nextCursor && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchProducts(nextCursor)}
              className="px-6 py-2 border hover:bg-black hover:text-white transition"
            >
              Load More
            </button>
          </div>
        )}

        {loading && products.length > 0 && (
          <p className="text-center mt-4">Loading more...</p>
        )}

      </div>
    </div>
  );
};

export default Collection;