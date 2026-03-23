import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};



// Route for user login
const loginUser = async (req, res,next) => {
  try {
    
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
   
    const token = createToken(user);
    res.status(200).json({ success: true, token });   

  } catch (error) {
    next(error)
  }
}


// Route for user register
const registerUser = async (req, res ,next ) => {
  try {

    const { name, email, password } = req.body;

    // Checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      const error = new Error("Please enter a valid email");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error("Please enter a strong password");
      error.statusCode = 400;
      throw error;
    }

    // Hashing user password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    const token = createToken(user);

    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
}


// Route for admin login
const adminLogin = async (req, res,next) => {
  try {
    
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
   
    if (user.role !== "admin") {
      
    return res.status(403).json({success:false,
      message: "Access denied. Admin only"
    });
    }
     
   
    const token = createToken(user);
    res.status(200).json({ success: true, token });   

  } catch (error) {
    next(error)
  }
}


export { loginUser, registerUser, adminLogin }
