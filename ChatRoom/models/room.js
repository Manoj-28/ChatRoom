import mongoose from "mongoose";

// Creating schema for room document
const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// creating the model using above schema
const Room = mongoose.model("Room", roomSchema);

export default Room;
