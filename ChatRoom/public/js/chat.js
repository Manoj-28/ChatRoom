// CHECK IF USER IS AUTHENTICATED
if (
  !localStorage.getItem("user") ||
  !JSON.parse(localStorage.getItem("user")).token
) {
  location.href = "auth.html";
}

// GETTING A SOCKET CONNECTION
const socket = io({
  query: {
    token: JSON.parse(localStorage.getItem("user")).token,
  },
});

// GET USERNAME FROM LS
const username = JSON.parse(localStorage.getItem("user")).username;

// Get room from query string (url) eg chat.html?room=room_name
const { room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

/* CHECK IF ROOM IS VALID AND SHOW APPROPRIATE RESULTS */
// CHECKS IF ROOM IS IN DATABASE USING : server_url/room/validate
async function _checkRoom(name) {
  return await fetch(`${SERVER_URL}/room/validate`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      //console.log("DATA ROOM: ", data);
      const { isValid, error } = data;

      if (!isValid) location.href = "chat.html";
      if (error) {
        alert(error);
        return;
      }
    })
    .catch((err) => {
      //console.log("ROOM ERROR: ", err);
      location.href = "chat.html";
    });
}

// GETTING HTML COMPONENTS
const welcome_container = document.querySelector("#welcome");
const chat_container = document.querySelector(".chat");
const chatForm = document.querySelector("#chat-form");
const chatMessage = document.querySelector(".chat-messages");

// If room is undefined then show welcome page else show room's chat page
if (!room) {
  welcome_container.innerHTML = `
        <nav id="nav2" class="navbar">
            <div id="room-name">Hi, ${username}</div>
            <button id="logout">logout</button>
        </nav>`;

  chat_container.classList.add("hide");
  welcome_container.classList.remove("hide");
} else {
  // CHECK IF ROOM IS CORRECT
  _checkRoom(room);
  chat_container.classList.remove("hide");
  welcome_container.classList.add("hide");

  // Room name
  const roomName = document.querySelector("#room-name");
  roomName.textContent = room;
  //console.log(username, room);

  // join chatroom
  socket.emit("joinRoom", { username, room });

  const _handleSend = function (e) {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit("chatMessage", msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  };

  chatForm.addEventListener("submit", _handleSend);
}

// Handling socket messages
//output message to dom
const outputMessage = function (message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const c =
    message.username === "CHAT-BOT"
      ? "chatbot_message"
      : message.username === username
      ? "u_message"
      : "o_message";
  div.classList.add(c + "_container");
  div.innerHTML = `<div class=${c}> <p class="meta">${message.username} <span>${message.date}</span></p>
          <p class="text">
              ${message.text}
          </p> </div>`;

  chatMessage.appendChild(div);
};

// For logging message
const _logMessage = function (message) {
  //console.log(message);
  outputMessage(message);
  chatMessage.scrollTop = chatMessage.scrollHeight;
};

// ADD SOCKET LISTENER FOR message event
socket.on("message", _logMessage);

/*  HANDLING LOGOUT BUTTON */
function _logout() {
  if (localStorage.getItem("user")) {
    localStorage.removeItem("user");
  }
  location.href = "auth.html";
}

const logoutButton = document.querySelector("#logout");
logoutButton.addEventListener("click", _logout);

const ROOM_CONTAINER = document.querySelector(".room");

// function to open chat room
function _onSelect(e) {
  console.log("SELECT");
  location.href = `chat.html?room=${e.target.textContent}`;
}

// GET ALL ROOMS FROM BACKEND using GET: server_url/room
async function _getRooms() {
  await fetch(`${SERVER_URL}/room`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      //console.log("ROOM DATA: ", data);
      const { rooms, error } = data;
      if (error) {
        alert(error);
        return;
      }
      // Adding room components dynamically
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        //console.log("ROOM: ", room);
        const { name } = room;
        const _room = document.createElement("div");
        _room.classList.add("single_room");
        _room.innerHTML = `<p>${name}</p>`;
        // Add event listener to select _room on click
        _room.addEventListener("click", _onSelect);
        ROOM_CONTAINER.appendChild(_room);
      }
    })
    .catch((err) => {
      console.log("GETTING ROOM ERROR: ", err);
    });
}

// Add rooms dynamically
_getRooms();

//logo on click making it go to welcome page
const logo = document.querySelector("#logo");
logo.addEventListener("click", function (e) {
  location.href = "chat.html";
});

//Create Room by POST to server_url/room with name of the room
function _createRoom(name) {
  return fetch(`${SERVER_URL}/room`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const { room, error } = data;
      if (error) {
        alert(error);
        return;
      }
      const { name } = room;
      return (location.href = `chat.html?room=${name}`);
    })
    .catch((err) => {
      console.log("CREATE ROOM ", err);
      return err;
    });
}

/* HANDLING MODAL FOR FOR CREATE ROOM */

// Getting HTML Elements
const modal = document.querySelector("#my-modal");
const modalBtn = document.querySelector("#create_room");
const closeBtn = document.querySelector(".close");
// Adding events listeners
modalBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);
// Open
function openModal() {
  modal.style.display = "block";
}
// Close
function closeModal() {
  modal.style.display = "none";
}
// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

// Adding functionalities to create room
const roomForm = document.querySelector("#room_form");
const roomButton = document.querySelector("#room_btn button");
roomButton.addEventListener("click", function (event) {
  event.preventDefault();
  const name = roomForm.name.value;
  _createRoom(name);
});
