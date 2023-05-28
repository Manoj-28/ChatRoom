import mongoose from "mongoose";

// Creating schema for the chat document 
const chatSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// creating model using the schema
const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
