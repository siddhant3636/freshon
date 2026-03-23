import React from 'react'

const Title = ({text1 ,text2}) => {
 return (
  <div className='flex flex-col items-center justify-center my-10 group'>
    <div className='flex items-center gap-4 sm:gap-6'>
      {/* Left Accent Bar */}
      <div className='hidden sm:block w-[1.5px] h-5 bg-[#d282a6] opacity-60 rounded-full rotate-[15deg]'></div>
      
      <h2 className='text-xl sm:text-2xl tracking-[0.25em] uppercase leading-none flex gap-3'>
        <span className='text-gray-400 font-light'>{text1}</span>
        <span className='text-gray-800 font-normal'>{text2}</span>
      </h2>

      {/* Right Accent Bar */}
      <div className='hidden sm:block w-[1.5px] h-5 bg-[#d282a6] opacity-60 rounded-full rotate-[15deg]'></div>
    </div>
    
    {/* Centered Decorative Underline */}
    <div className='relative mt-4 flex justify-center items-center'>
        <div className='w-16 h-[1px] bg-gray-100 transition-all duration-700 group-hover:w-32 group-hover:bg-gray-200'></div>
        {/* Tiny pink center dot to anchor the look */}
        <div className='absolute w-1 h-1 rounded-full bg-[#d282a6] opacity-40'></div>
    </div>
  </div>
)
}

export default Title
