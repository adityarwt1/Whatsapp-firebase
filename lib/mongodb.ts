import mongoose from "mongoose";

export const connnectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "WhatsAppClone",
    });
  } catch (error) {
    console.log("failed to connnect with mongodb");
  }
};
