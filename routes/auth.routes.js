import express from "express";
import { registerBusiness, loginBusiness } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerBusiness);
router.post("/login", loginBusiness);

export default router;

