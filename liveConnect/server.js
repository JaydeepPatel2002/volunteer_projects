const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
//const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const { createAdapter } = require("@socket.io/postgres-adapter");
const {Pool,Client}= require('pg')
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));





const botName = "live-connect AI agent";


//========================================


// this is a connection to my local database in my personal computer (Jaydeep patel). it will not work in your pc.

//const connectionString='important lines come here'


const connectionString='postgressql://postgres:Roshani@2002@localhost:5432/postgres'

//Creating Client
const client2= new Client({
  connectionString:connectionString
})
client2.connect();
client2.query('SELECT * FROM public."customer"',(err,res)=>{
  if(!err){
    console.log(res.rows);
    console.log("success");

  }
  else
  {
    console.log(err.message);
    console.log("fail");
  }
  client2.end;
})
io.adapter(createAdapter(client2));
io.listen(3001);
module.exports = client2;

//=============================================

// (async () => {
//   pubClient = createClient({ url: 'redis://127.0.0.1:3000' });
//   await pubClient.connect();
//   subClient = pubClient.duplicate();
//   io.adapter(createAdapter(pubClient, subClient));
// })();

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Live connect!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
