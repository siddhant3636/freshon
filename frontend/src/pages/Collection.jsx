import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/frontend_assets/assets';
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { toast } from 'react-toastify';

const Collection = () => {

  const { backendUrl ,search} = useContext(ShopContext);
  const [showFilter, setShowFilters] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  //Debounce Search
  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500); // 500ms delay

  return () => clearTimeout(timer);
}, [search]);




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
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(category.length && { category: category.join(",") }),
        ...(subCategory.length && { subCategory: subCategory.join(",") }),
        ...(sortType !== "relevant" && { sort: sortType }),
        ...(cursor && { cursor })
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
  setProducts([]);          
  setNextCursor(null);
  fetchProducts(null, true);
  }, [category, subCategory, sortType,debouncedSearch]);

  return (
<div className='flex flex-col sm:flex-row gap-6 sm:gap-12 pt-10 px-4 md:px-0'>

  {/* Left Sidebar - Filters */}
  <div className='w-full sm:w-64 shrink-0'>
    {/* Mobile Toggle & Desktop Title */}
    <div 
      onClick={() => setShowFilters(!showFilter)}
      className='flex items-center justify-between cursor-pointer mb-6 sm:mb-8 bg-gray-50 p-4 rounded-xl sm:bg-transparent sm:p-0 sm:rounded-none'
    >
      <p className='text-lg font-bold text-gray-900 tracking-wider'>
        FILTERS
      </p>
      <img
        className={`h-4 transition-transform duration-300 sm:hidden ${showFilter ? '-rotate-180' : ''}`}
        src={assets.dropdown_icon}
        alt="Toggle"
      />
    </div>

    {/* Filters Wrapper */}
    <div className={`space-y-6 ${showFilter ? 'block' : 'hidden'} sm:block`}>
      
      {/* Category Card */}
      <div className='bg-white border border-gray-100 shadow-sm rounded-2xl p-6'>
        <p className='mb-4 text-sm font-bold text-gray-800 tracking-wide uppercase'>Categories</p>
        <div className='flex flex-col gap-3'>
          {["Men", "Women", "Kids"].map(item => (
            <label key={item} className='flex items-center gap-3 text-gray-600 hover:text-black transition-colors cursor-pointer group'>
              <input
                type="checkbox"
                value={item}
                onChange={toggleCategory}
                className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer'
              />
              <span className='text-sm font-medium group-hover:translate-x-1 transition-transform'>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Card */}
      <div className='bg-white border border-gray-100 shadow-sm rounded-2xl p-6'>
        <p className='mb-4 text-sm font-bold text-gray-800 tracking-wide uppercase'>Type</p>
        <div className='flex flex-col gap-3'>
          {["Topwear", "Bottomwear", "Winterwear"].map(item => (
            <label key={item} className='flex items-center gap-3 text-gray-600 hover:text-black transition-colors cursor-pointer group'>
              <input
                type="checkbox"
                value={item}
                onChange={toggleSubCategory}
                className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer'
              />
              <span className='text-sm font-medium group-hover:translate-x-1 transition-transform'>{item}</span>
            </label>
          ))}
        </div>
      </div>
      
    </div>
  </div>

  {/* Right Side - Products */}
  <div className='flex-1'>
    
    {/* Header Section (Title & Sorting) */}
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6'>
      <Title text1={'ALL'} text2={'COLLECTION'} />
      
      <div className='flex items-center gap-4'>
        {/* Desktop Product Count Badge */}
        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {totalCount} Products
        </span>
        
        {/* Modern Sort Dropdown */}
        <select
          onChange={(e) => setSortType(e.target.value)}
          className='bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-black focus:border-black block p-2.5 shadow-sm outline-none cursor-pointer transition-all hover:border-gray-300'
        >
          <option value="relevant">Sort by: Relevant</option>
          <option value="low_high">Price: Low to High</option>
          <option value="high_low">Price: High to Low</option>
        </select>
      </div>
    </div>

    {/* Mobile Product Count */}
    <p className="md:hidden mb-4 text-sm font-medium text-gray-500">
      {totalCount} Products Found
    </p>

    {/* Initial Loading Skeleton */}
    {loading && products.length === 0 && ( 
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className='text-gray-500 font-medium animate-pulse'>Curating collection...</p>
      </div>
    )}

    {/* Product Grid */}
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
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

    {/* Load More Button */}
    {nextCursor && !loading && (
      <div className="flex justify-center mt-12 mb-8">
        <button
          onClick={() => fetchProducts(nextCursor)}
          className="group relative px-8 py-3 bg-black text-white text-sm font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="relative z-10">Discover More</span>
          <div className="absolute inset-0 bg-gray-800 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0"></div>
        </button>
      </div>
    )}

    {/* Pagination Loading State */}
    {loading && products.length > 0 && (
      <div className="flex justify-center mt-8 mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100 shadow-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          Loading more styles...
        </div>
      </div>
    )}

  </div>
</div>

  );
};

export default Collection;