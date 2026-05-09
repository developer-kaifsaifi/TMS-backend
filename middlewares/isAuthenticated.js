import jwt from "jsonwebtoken";
import { Business } from "../models/Business.js";
import  useTryCatch  from "../utils/useTryCatch.js";


export const isAuthenticated = useTryCatch(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Please login to access this resource" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🔥 CRITICAL: Token sign karte waqt '_id' use kiya tha, wahi yahan decode hoga
    req.user = await Business.findById(decoded._id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
});