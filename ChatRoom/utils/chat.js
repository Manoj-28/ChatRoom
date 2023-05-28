import asyncHandler from "express-async-handler";
import Chat from "../models/chat.js";
import User from "../models/user.js";

// GETTING ALL CHATS FOR A ROOM
export const getChatForRoom = async (room) => {
  try {
    const chats = await Chat.find({ room }).sort("-date");
    const hist = [];
    chats.map((chat) =>
      hist.push({
        username: chat.username,
        content: chat.content,
        date: chat.createdAt,
      })
    );
    return hist;
  } catch (err) {
    if (process.env.STAGE === "DEVELOPMENT") {
      console.log("GETTING ALL CHATS ERROR: ", err);
      throw err;
    }
  }
};

// METHOD TO ADD A CHAT MESSAGE TO DATABASE
export const createChat = async (user_id, content, room) => {
  try {
    const user = await User.findById(user_id);
    if (user) {
      const chat = await Chat.create({
        user,
        room,
        content,
        username: user.username,
      });
    } else {
      if (process.env.STAGE === "DEVELOPMENT") {
        console.log("CREATING CHAT ERROR: INVALID USER");
        throw new Error("INVALID USER TRYING TO CREATE CHAT!!");
      }
    }
  } catch (err) {
    if (process.env.STAGE === "DEVELOPMENT") {
      console.log("CREATING CHAT ERROR: ", err);
      throw err;
    }
  }
};

// PROTECTED ROUTE
// POST METHOD
// SAVE A MESSAGE TO DB
// NO ROUTES YET
// protected route so req.user has user present
export const saveMessage = asyncHandler(async (req, res) => {
  const { content, room } = req.body;
  if (!content || !room) {
    res.status(400);
    res.json({ error: "Invalid request for storing message!!" });
  } else {
    try {
      const user = await User.findById(req.user.id);
      const chat = await Chat.create({
        user: user._id,
        room,
        content,
        username: user.username,
      });
      res.status(200);
      res.json({ chat });
    } catch (err) {
      if (process.env.STAGE === "DEVELOPMENT")
        console.error("STORING CHAT ERROR: ", err);
      res.status(400);
      res.json({ error: "Something went wrong while storing message!!" });
    }
  }
});
