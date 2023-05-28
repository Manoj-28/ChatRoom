import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Importing user model
import dotenv from "dotenv"; // For using .env file
dotenv.config();

// Generating jwt token using id and secret
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET);
};
/* 
  Session based tokens were stored in a particular server. But with jwt we can store 
  the info inside the token and various servers can access that info 
*/

// Middleware for checking if token is valid
export const authentication = (req, res, next) => {
  let token = req.headers["authorization"];
  if (token && token.split(" ")[0] === "Bearer") {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err || !user) {
        res.status(400);
        res.json({ error: "Authentication failed!" });
      } else {
        req.user = user;
        next();
      }
    });
  }
};

// POST METHOD
// USER LOGIN METHOD
// route: /login
export const loginRoute = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Checking if user exists and entered passwords match
    if (user) {
      if (!(await user.matchPassword(password))) {
        res.status(400);
        return res.json({ error: "Invalid password for the user!!" });
      }
      const token = generateToken(user._id);
      res.status(200);
      res.json({ token, username: user.username });
    } else {
      res.status(400);
      res.json({ error: "Invalid User" });
    }
  } catch (err) {
    if (process.env.STAGE === "DEVELOPMENT") console.log("SIGNIN ERROR: ", err);
    res.status(500);
    return res.json({ error: "Something went wrong while logging in user!!" });
  }
});

// POST METHOD
// USER SIGNUP METHOD
// route: /register
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400);
      res.json({ error: "Invalid request" });
    }
    const userExists = await User.findOne({ email });
    const usnameExists = await User.findOne({ username });
    if (userExists || usnameExists) {
      res.status(400);
      res.json({ error: "User already exists!" });
    }
    const user = await User.create({ username, email, password });
    if (user) {
      res.status(200);
      res.json({
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      if (process.env.STAGE === "DEVELOPMENT")
        console.log("REGISTERING ERROR: USER WASNT CREATED");
      res.status(500);
      return res.json({
        error: "Something went wrong while registering in user!!",
      });
    }
  } catch (err) {
    if (process.env.STAGE === "DEVELOPMENT")
      console.log("REGISTERING ERROR: ", err);
    res.status(500);
    return res.json({
      error: "Something went wrong while registering in user!!",
    });
  }
});
