/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ON `);
  } catch (error) {
    console.error('connecting to MongoDB: OFF', error);
    process.exit(1);
  }
};