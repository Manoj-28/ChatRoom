import mongoose from "mongoose";
import dotenv from "dotenv"; // for accessing .env files
dotenv.config();

// GETTING A CONNECTION WITH LOCAL MONGO SERVER
export const mongoConnection = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MONGODB CONNECTION ESTABLISHED!`);
  } catch (err) {
    console.error("MONGO DB ERROR: ", err);
    process.exit(1);
  }
};
