import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('connected to database');
}

export default connectDB;