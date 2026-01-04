import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();
//in the dotenv, you should have put /products so the databse name is also products.
//This is connecting to the DB.
export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.ATLAS_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log("In this error gang!")
        console.error(`Error: ${error.message}`);
        process.exit(1); //Exit with status code 1
    }
}