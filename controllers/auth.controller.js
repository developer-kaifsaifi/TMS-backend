import { Business } from "../models/Business.js";
import  useTryCatch  from "../utils/useTryCatch.js";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerBusiness = useTryCatch(async (req, res) => {
   const { name, email, password } = req.body;

  // Check agar email pehle se exist karti hai
  const existingBusiness = await Business.findOne({ email });
  if (existingBusiness) {
    return res.status(400).json({ success: false, message: "Business already registered with this email" });
  }

  // Password Hash karo
  const hashedPassword = await bcrypt.hash(password, 10);

  // Database me Business create karo (Bina QR ke pehle save karenge taki _id mil jaye)
  const business = await Business.create({
    name,
    email,
    password: hashedPassword,
  });

  // Frontend ka scan URL jise customer scan karega
  // (PORT aur Domain baad me environment variables se replace kar lena)
  // registerBusiness controller ka ye part update karke dekho:
const scanUrl = `http://localhost:5173/scan/${business._id}`;
const qrImageBase64 = await QRCode.toDataURL(scanUrl);

// Seedhe update command chalao
await Business.findByIdAndUpdate(business._id, { qrCodeUrl: qrImageBase64 });

// Phir response bhejo
res.status(201).json({
  success: true,
  business: {
    _id: business._id,
    name: business.name,
    qrCodeUrl: qrImageBase64, // Direct yahi variable bhej do safety ke liye
  },
  authToken,
});
});

export const loginBusiness = useTryCatch(async (req, res) => {
   const { email, password } = req.body;

  const business = await Business.findOne({ email });
  if (!business) {
    return res.status(404).json({ success: false, message: "Invalid Email or Password" });
  }

  const isPasswordMatch = await bcrypt.compare(password, business.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ success: false, message: "Invalid Email or Password" });
  }

  const authToken = jwt.sign({ _id: business._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(200).json({
    success: true,
    message: `Welcome back, ${business.name}`,
    business: {
      _id: business._id,
      name: business.name,
      qrCodeUrl: business.qrCodeUrl,
    },
    authToken,
  });
});
