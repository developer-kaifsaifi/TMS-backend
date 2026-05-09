import mongoose from "mongoose";





const connectDB = async () => {
  try {
    // MONGO_URI aapki .env file se aayega
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n MongoDB Connected! DB Host: ${connectionInstance.connection.host} 🚀`);
  } catch (error) {
    console.error("MongoDB Connection Error: ", error);
    process.exit(1); // Agar DB connect na ho, toh server app ko stop kar do
  }
};

export default connectDB;