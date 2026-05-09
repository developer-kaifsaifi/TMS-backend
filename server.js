import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from './utils/config.db.js';
import authRoutes from "./routes/auth.routes.js";
import tokenRoutes from "./routes/token.routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS setup for both Express and Socket.io
const allowedOrigins = ["https://digiflow-chi.vercel.app", "http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  }
});

// Global io object
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinBusiness", (businessId) => {
    if (businessId) {
      socket.join(businessId.toString());
      console.log(`📂 Joined Business Room: ${businessId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tokens', tokenRoutes);

app.get('/', (req, res) => {
  res.send('Token System Backend is Running! 🚀');
});

// Start Server
httpServer.listen(PORT, async () => {
  await connectDB(); 
  console.log(`🚀 Server is running on port: ${PORT}`);
});