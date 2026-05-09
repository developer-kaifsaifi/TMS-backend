import express from "express";
import { generateToken, getActiveTokens, getTokenStatus, resetQueue, serveToken } from "../controllers/token.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// 1. PUBLIC ROUTES (Inmein isAuthenticated NAHI hona chahiye)
// Kyunki customer login nahi karega
router.post("/generate/:businessId", generateToken);
router.get("/status/:tokenId", getTokenStatus); // ✅ Yahan se isAuthenticated hata diya

// 2. PROTECTED ROUTES (Sirf Business Owner ke liye)
router.get("/active-tokens", isAuthenticated, getActiveTokens);
router.patch("/serve/:tokenId", isAuthenticated, serveToken);
router.delete("/reset-queue", isAuthenticated, resetQueue);

export default router;