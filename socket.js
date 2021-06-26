const uniqid = require("uniqid");

const { addUser, removeUsersInRoom, removeUser, getUser, getUsersInRoom } = require("./users");

const socketConfig = (io) => {

  const handleLeave = (socket) => {
    const user = removeUser(socket.id)
    if (user) {
      socket.broadcast.to(user.room).emit(
        "message", { user: "System", text: `${user.name} has left!` }
      );
      io.in(user.room).emit("roomData", getUsersInRoom(user.room));
      socket.broadcast.to(user.room).emit(
        "message", { user: "System", text: "Closing room in 5 seconds" }
      );
      removeUsersInRoom(user.room);
      io.in(user.room).emit("endRoom")
      setTimeout(() => {
        io.in(user.room).emit("joinNew")
      },5000);
    }
  }

  io.on("connection", (socket) => {

    // When user tries to join a room
    socket.on("join", ({ name }, callback) => {
      let user;
      const arr = Array.from(io.sockets.adapter.rooms);
      for (const room of arr) {
        if (!room[1].has(room[0])) {
          // Checking if the room only has one user
          if (room[1].size == 1) {
            user = addUser({ id: socket.id, name, room: room[0] });
          }
        }
      }
      if (!user) {
        roomId = uniqid();
        user = addUser({ id: socket.id, name, room: roomId });
      }
      socket.join(user.room);

      callback(user.room)
      // Join message 
      socket.emit("message", { user: "System", text: `Welcome ${user.name}!` })
      socket.broadcast.to(user.room).emit(
        "message", { user: "System", text: `${user.name} has joined!` }
      );
      io.in(user.room).emit("roomData", getUsersInRoom(user.room));
    })

    // When user leaves a room
    socket.on("leaveRoom", () => {
      handleLeave(socket);
    }) 

    // When user leaves the website
    socket.on("disconnect", () => {
      handleLeave(socket);
    })

    // When user sends a message
    socket.on("sendMessage", ({text, file},callback) => {
      const user = getUser(socket.id)
      if (user) {
        io.to(user.room).emit("message", {text, file, user: user.name })
        callback()
      }
    })

    // Fetching typing information for each room
    socket.on("typingData", ({ name, typing }) => {
      const user = getUser(socket.id)
      if (user) {
        socket.to(user.room).emit("sendTypingData", { name, typing });
      }
    })
    
  })
}

module.exports = socketConfig;