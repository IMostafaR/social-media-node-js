import mongoose from "mongoose";

export const db = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("Database connected:", mongoose.connections[0].name);
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
};
