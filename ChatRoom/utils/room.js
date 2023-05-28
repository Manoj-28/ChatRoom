import asyncHandler from "express-async-handler";
import Room from "../models/room.js";

// GET METHOD: Route /room
// Get all the rooms present in the database
// PROTECTED ROUTE
export const getAllRooms = asyncHandler(async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200);
    res.json({ rooms });
  } catch (err) {
    res.status(500);
    res.json({ error: "Something went wrong! Please reload the page! ", err });
  }
});

// POST METHOD : route /room/validate
// Checks if a room with the given name exists in db
// PROTECTED
export const isValidRoom = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      return res.json({ error: "Send a valid room!!" });
    }

    const exists = await Room.findOne({ name });
    if (exists) {
      res.status(200);
      return res.json({ isValid: true });
    } else {
      res.status(400);
      return res.json({ isValid: false, error: "Invalid Room name!!" });
    }
  } catch (err) {
    res.status(500);
    res.json({
      isValid: false,
      error: "Something went wrong could check room! ",
      err,
    });
  }
});

// POST METHOD : route /room
// Create a room in db
// PROTECTED
export const createRoom = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      return res.json({ error: "Send a valid room!!" });
    }

    const exists = await Room.findOne({ name });
    if (exists) {
      res.status(400);
      return res.json({ error: "Room name not unique!!" });
    } else {
      const newRoom = await Room.create({ name });
      res.status(200);
      return res.json({ room: newRoom });
    }
  } catch (err) {
    res.status(500);
    res.json({ error: "Something went wrong could not create room! ", err });
  }
});
