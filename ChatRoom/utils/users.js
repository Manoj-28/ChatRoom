// THIS FILE IS TO KEEP A TRACK OF SOCKET CONNECTION THAT ARE ACTIVE AND IN WHICH ROOM

const users = [];

// Checks if given user is in the room 
export const checkIfPresent = (username, room) => {
  const user = users.filter(
    (user) => user.username === username && user.room === room
  );
  return user.length > 0;
};

// get all the users in the socket
export const getUsers = () => {
  return users;
};

// add a new user
export const userJoin = (id, username, room) => {
  const user = { id, username, room };
  users.push(user);
  return user;
};

// get user based on socket id
export const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

// remove user connection ones disconnects
export const disconnectUser = (id) => {
  const ind = users.findIndex((user) => user.id === id);
  if (ind !== -1) {
    return users.splice(ind, 1);
  }
};
