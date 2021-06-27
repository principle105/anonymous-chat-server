const { 
  addUser, 
  removeUsersInRoom, 
  removeUser, 
  getUser, 
  getUsersInRoom, 
  withoutSocketObj 
} = require("./users");

const socketConfig = (io) => {

  const handleLeave = (socket) => {
    // Erasing user data
    const user = removeUser(socket.id);
    if (user) {
      // Erasing all users in room
      removeUsersInRoom(user.room);

      io.in(user.room).emit("roomData", {
        users: withoutSocketObj(getUsersInRoom(user.room)), 
        name: user.room
      });
      // Sending leaving messages
      socket.broadcast.to(user.room).emit(
        "message", { user: "System", text: `${user.name} has left!` }
      );
      socket.broadcast.to(user.room).emit(
        "message", { user: "System", text: "Closing room in 5 seconds" }
      );
      // Ending room for other clients and joining new room
      io.in(user.room).emit("endRoom")
      setTimeout(() => {
        io.in(user.room).emit("joinNew")
      },5000);
    }
  }

  io.on("connection", (socket) => {

    socket.on("join", ({ name }, callback) => {
      const { user, error } = addUser({ id: socket.id, name, socket });

      // If an error occured while joining
      if(error) return callback(error);

      // If the user was not paired up
      if (!user.room) {
        callback(); 
        return
      }

      getUsersInRoom(user.room).map((u) => {
        // Making other user join the room
        u.socket.join(user.room)
        // Welcome message
        socket.emit("message", { user: "System", text: `Welcome ${u.name}!` })
        socket.broadcast.to(user.room).emit(
          "message", { user: "System", text: `${u.name} has joined!` }
        );
      })
      // Sending new room information to client
      io.in(user.room).emit("roomData", {
        users: withoutSocketObj(getUsersInRoom(user.room)),
        name: user.room
      });

      callback();
      
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
    socket.on("sendMessage", ({text, file}, callback) => {
      const user = getUser(socket.id)
      if (user) {
        io.to(user.room).emit("message", { text, file, user: user.name });
        callback();
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