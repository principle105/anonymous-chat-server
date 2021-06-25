// Stores data on users
let users = [];

const addUser = ({ id, name, room }) => {
  const user = { id, name, room };
  users.push(user);
  return user
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if(index !== -1) return users.splice(index, 1)[0];
}

const removeUsersInRoom = (room) => {
  users = users.filter(user => user.room !== room);
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, removeUsersInRoom, getUser, getUsersInRoom };