// Stores data on users
let users = [];

const addUser = ({ id, name, room }) => {
  const user = { id, name, room };
  users.push(user);
  return user
}

const removeUser = (room) => {
  console.log(users)
  users = users.filter(user => user.room !== room);
  console.log(users)
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };