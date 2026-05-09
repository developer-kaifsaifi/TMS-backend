import mongoose, { model, Schema } from "mongoose";


const businessSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  qrCodeUrl: { type: String }, 
  tokenSequence: { type: Number, default: 0 } 
});

export const Business = model("Business", businessSchema)
