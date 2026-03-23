import React from 'react'
import { assets } from '../assets/frontend_assets/assets'
const Footer = () => {
  
  const year=new Date().getFullYear();
   
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm' >
       <div>
         <img src={assets.logo1}  className='mb-5 w-32' alt="" />
         <p className='w-full md:w-2/3 text-gray-600 ' >Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.        </p>
       </div>

       <div>
         <p className='text-xl font-medium' >COMPANY</p>
         <ul className='flex flex-col gap-1 text-gray-600'  >
           <li>Home</li>
           <li>About us</li>
           <li>Delivery</li>
           <li>Privacy policy</li>
         </ul>
       </div>

       <div >
         <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
         <ul className='flex flex-col gap-1 text-gray-600'  >
           <li>+91-8787 237 960</li>
           <li>siddhant.singh.jadon.36@gamil.com</li>
         </ul>
        </div>
        
      </div>

      <div>
       <hr />
       <p className='py-5 text-sm text-center'>Copyright {year}@freshon.com -All Rights Reserverd</p>
      </div>

    </div>
    


  )
}

export default Footer
