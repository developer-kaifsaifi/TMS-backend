import mongoose, { model, Schema } from "mongoose";

const tokenSchema = new Schema({
    businessId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Business', 
      required: true 
    },
    tokenNumber: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['WAITING', 'SERVED', 'EXPIRED'], 
      default: 'WAITING' 
    },
    
    createdAt: { type: Date, default: Date.now, expires: 14400 } 
  });


export const Token = model("Token", tokenSchema)
