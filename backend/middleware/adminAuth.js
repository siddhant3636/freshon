

export const adminAuth = (req, res, next) => {
  
  if (req.body.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only"
    });
  }

  next();
};

export default adminAuth;
