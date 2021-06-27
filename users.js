const uniqid = require("uniqid");

// Stores data on users
let users = [];

// Adding user to list
const addUser = ({ id, name, socket }) => {
  if (users.some(u => u.name === name)) {
    let randomString = Math.random().toString(36).substr(2, 2);
    name = `${name}-${randomString}`
  }
  // Finding a room for the user
  let room;
  users.forEach((user,i) => {
    if (!user.room) {
      users[i].room = uniqid();
      room = user.room
      return
    }
  })
  // Checking if an open room was found
  if (!room) 
    room = null

  const user = { id, name, room, socket };
  users.push(user);
  return { user };
}

// Remove user from list
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if(index !== -1) return users.splice(index, 1)[0];
}

// Remove all users from room
const removeUsersInRoom = (room) => {
  users = users.filter(user => user.room !== room);
}

// Get user from id
const getUser = (id) => users.find((user) => user.id === id);

// Get users in room
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

// Remove socket object to prepare user list to be sent across websocket
const withoutSocketObj = (userList) => {
  return userList.map(({socket, ...item}) => item)
}

module.exports = { 
  addUser, 
  removeUser, 
  removeUsersInRoom, 
  getUser, 
  getUsersInRoom, 
  withoutSocketObj 
};