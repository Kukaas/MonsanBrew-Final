import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
}

export default connectDB;
