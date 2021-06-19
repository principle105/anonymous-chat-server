var uniqid = require("uniqid");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const socketConfig = (io) => {

  io.on("connection", (socket) => {
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

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      if (user) {
        socket.broadcast.to(user.room).emit(
          "message", { user: "System", text: `${user.name} has left!` }
        );
        io.in(user.room).emit("roomData", getUsersInRoom(user.room));
        socket.broadcast.to(user.room).emit(
          "message", { user: "System", text: "Closing room in 5 seconds" }
        );
        setTimeout(() => {
          socket.broadcast.to(user.room).emit("endRoom")
        },5000);
      }
    }) 

    socket.on("sendMessage", (text,callback) => {
      const user = getUser(socket.id)
      io.to(user.room).emit("message", { user: user.name, text })
      callback()
    })
    
  })
}

module.exports = socketConfig;