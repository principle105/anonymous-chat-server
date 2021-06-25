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
    console.log("new connection")
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

    socket.on("leaveRoom", () => {
      handleLeave(socket);
    }) 

    socket.on("disconnect", () => {
      handleLeave(socket);
    })

    socket.on("sendMessage", (text,callback) => {
      const user = getUser(socket.id)
      if (user) {
        io.to(user.room).emit("message", { user: user.name, text })
        callback()
      }
    })
    
  })
}

module.exports = socketConfig;