import { Business } from "../models/Business.js";
import { Token } from "../models/Token.js";
import  useTryCatch  from "../utils/useTryCatch.js";



export const generateToken = useTryCatch(async (req, res) => {
  const { businessId } = req.params;

  // 1. Sequence badhao
  const business = await Business.findByIdAndUpdate(
    businessId,
    { $inc: { tokenSequence: 1 } },
    { new: true } 
  );

  if (!business) {
    return res.status(404).json({ success: false, message: "Business not found" });
  }

  // 2. Token create karo
  const newToken = await Token.create({
    businessId: business._id,
    tokenNumber: business.tokenSequence,
    status: "WAITING",
  });

  // 3. Socket Notification (Real-time Dashboard Update)
  const io = req.app.get("io");
  if (io) {
    console.log(`📢 Sending update to room: ${businessId}`);
    io.to(businessId.toString()).emit("newTokenGenerated", newToken);
  }

  res.status(201).json({
    success: true,
    message: "Token generated successfully",
    token: newToken 
  });
});
export const getActiveTokens = useTryCatch(async (req, res) => {
  // DEBUG: Pehle saare tokens dhoondo bina kisi filter ke
  const allTokens = await Token.find({});
  console.log("Total Tokens in DB:", allTokens.length);

  // Filter ke saath dhoondo
  const businessId = req.user._id; 
  const tokens = await Token.find({ 
    businessId: businessId, 
    status: "WAITING" 
  }).sort({ tokenNumber: 1 });

  console.log("Tokens for this Business:", tokens.length);

  res.status(200).json({
    success: true,
    tokens // Agar ye empty hai, toh matlab ID match nahi ho rahi
  });
});
// Isse Dashboard ke liye active tokens milenge
// export const getActiveTokens = useTryCatch(async (req, res) => {
//   // Sabse pehle console mein dekho ki ID kya aa rahi hai
//   console.log("Logged in User ID:", req.user._id);

//   // KAI BAAR Business ID req.user._id nahi hoti, balki req.user.businessId hoti hai
//   const searchId = req.user.businessId || req.user._id;

//   const tokens = await Token.find({ 
//     businessId: searchId, 
//     status: "WAITING" 
//   }).sort({ tokenNumber: 1 });

//   console.log("Found Tokens in DB:", tokens.length); // Agar ye 0 hai toh DB mein ID galat save ho rahi hai

//   res.status(200).json({
//     success: true,
//     tokens
//   });
// });

export const serveToken = useTryCatch(async (req, res) => {
  const { tokenId } = req.params;

  const updatedToken = await Token.findByIdAndUpdate(tokenId, { status: 'SERVED' }, { new: true });

  // Agla number dhoondo jo ab screen par dikhana hai
  const nextToken = await Token.findOne({
    businessId: updatedToken.businessId,
    status: 'WAITING'
  }).sort({ tokenNumber: 1 });

  const io = req.app.get("io");
  io.to(updatedToken.businessId.toString()).emit("queueUpdated", {
    currentServing: nextToken ? nextToken.tokenNumber : updatedToken.tokenNumber
  });

  res.status(200).json({ success: true, message: "Served" });
});

// Customer ke liye token ki live details nikalna
export const getTokenStatus = useTryCatch(async (req, res) => {
  const { tokenId } = req.params;

  const token = await Token.findById(tokenId);
  if (!token) return res.status(404).json({ success: false, message: "Token not found" });

  // Pata karo ki is business ka abhi kaunsa number chal raha hai
  // getTokenStatus controller mein ye logic check karein:
const currentServingToken = await Token.findOne({
  businessId: token.businessId,
  status: 'WAITING' // Dashboard par pehla waiting hi serve ho raha hota hai
}).sort({ tokenNumber: 1 });

// Agar koi waiting nahi hai, toh aakhiri SERVED wala dikhao
const lastServed = await Token.findOne({
  businessId: token.businessId,
  status: 'SERVED'
}).sort({ tokenNumber: -1 });

const currentNum = currentServingToken ? currentServingToken.tokenNumber : (lastServed ? lastServed.tokenNumber : 0);

  res.status(200).json({
    success: true,
    token: {
      _id: token._id,
      tokenNumber: token.tokenNumber,
      businessId: token.businessId,
      currentServing: currentServingToken ? currentServingToken.tokenNumber : (lastServedToken ? lastServedToken.tokenNumber : 0)
    }
  });
});


// Reset Queue Logic
export const resetQueue = useTryCatch(async (req, res) => {
  const businessId = req.user._id;

  // 1. Business ki sequence ko 0 set karo taaki agla token #1 ho
  await Business.findByIdAndUpdate(businessId, { tokenSequence: 0 });

  // 2. Us business ke saare active tokens delete karo
  await Token.deleteMany({ businessId });

  // 3. Socket ke zariye Dashboard aur Customer dono ko batao
  const io = req.app.get("io");
  if (io) {
    io.to(businessId.toString()).emit("queueReset");
  }

  res.status(200).json({
    success: true,
    message: "Queue has been reset successfully. Next token will be #1."
  });
});