import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { formatMessage } from "./utils/message.js";
import {
  checkIfPresent,
  getCurrentUser,
  userJoin,
  disconnectUser,
} from "./utils/users.js";
import { authentication, loginRoute, registerUser } from "./utils/auth.js";
import { mongoConnection } from "./db.js";
import { createChat, getChatForRoom } from "./utils/chat.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createRoom, getAllRooms, isValidRoom } from "./utils/room.js";

// for allowing us to use env connection during development
dotenv.config();

// Connnecting to local database
mongoConnection();

const app = express();
// JSON body parser
app.use(express.json());
// Auth routes
app.post("/login", loginRoute);
app.post("/register", registerUser);
// Room routes: all are protected with middleware
app.post("/room", authentication, createRoom);
app.get("/room", authentication, getAllRooms);
app.post("/room/validate", authentication, isValidRoom);

const botName = "CHAT-BOT";

//ADDING FRONTEND FILES AS STATIC FILES
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, `public`)));

// CREATING SOCKET SERVER
const server = createServer(app);
// SOCKET IO
const io = new Server(server);
io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          if (process.env.STAGE === "DEVELOPMENT")
            console.error("AUTH ERROR", err);
          return next(new Error("Authentication error"));
        }
        socket.userId = decoded.id;
        next();
      }
    );
  } else {
    return new Error("Authentication error");
  }
}).on("connection", (socket) => {
  // load all messages on joining a room
  if (process.env.STAGE === "DEVELOPMENT")
    console.log(`SOCKET CONNECTION ESTABLISHED!!!`);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.user = { user, room };
    // show previous messages
    getChatForRoom(room)
      .then((history) => {
        for (let i = 0; i < history.length; i++) {
          const chat = history[i];
          const { username, content, date } = chat;
          socket.emit("message", formatMessage(username, content, date));
        }

        // custom message from bot
        socket.emit(
          "message",
          formatMessage(botName, `Welcome to chat room, ${user.username}!!`)
        );

        //broadcast to rest of the users
        socket.broadcast
          .to(user.room)
          .emit(
            "message",
            formatMessage(botName, `${user.username} has joined this chat`)
          );
      })
      .catch((err) => {
        if (process.env.STAGE === "DEVELOPMENT") console.log("HISTORY : ", err);
      });
  });

  // listents for chatMessage even and adds it to db
  socket.on("chatMessage", (message) => {
    // Add messages to db;
    createChat(socket.userId, message, socket.user.room)
      .then((res) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, message));
      })
      .catch((err) => {
        if (process.env.STAGE === "DEVELOPMENT")
          console.log("SAVING CHAT: ", err);
      });
  });

  // Checks if socket disconnected
  socket.on("disconnect", () => {
    // io.emit(
    //   "message",
    //   formatMessage(botName, `${socket.user?.username} disconnected!!`)
    // );
    disconnectUser(socket.id);
  });
});

//Page Not Found
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/error.html");
});

// LISTENING TO PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  if (process.env.STAGE === "DEVELOPMENT")
    console.log(`SERVER STARTED ON PORT ${PORT}`);
});
