// CHECK IF USER IS AUTHENTICATED
if (
  localStorage.getItem("user") &&
  JSON.parse(localStorage.getItem("user")).token
) {
  location.href = "chat.html";
}

// GETTING HTML ELEMENTS
const loginForm = document.getElementById("login-form");
const SignupForm = document.getElementById("signup-form");
const loginButton = document.getElementById("btn1");
const SignupButton = document.getElementById("btn2");
const container = document.querySelector("#container");

// Toglling between forms
function toggleForm() {
  container.classList.toggle("active");
}

// Adding login by POST request to : server_url/login
loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  let data_login = { email, password };

  fetch(`${SERVER_URL}/login`, {
    method: "POST",
    body: JSON.stringify(data_login),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((res) => {
      //   console.log("Request complete! response:");
      return res.json();
    })
    .then((data) => {
      const { error, token, username } = data;
      if (error) {
        alert(error);
        return;
      } else {
        //console.log("DATA RECIEVED: ", { token, username });
        localStorage.setItem("user", JSON.stringify({ token, username }));
        location.href = "chat.html";
      }
    })
    .catch((error) => {
      console.log("response error:", error);
      alert("Something went wrong !! Try again");
    });
});

// registering user by POST req to :server_url/register
SignupButton.addEventListener("click", (event) => {
  event.preventDefault();
  const username = SignupForm.username.value;
  const email = SignupForm.email.value;
  const password = SignupForm.password.value;

  let data_register = { username, email, password };

  fetch(`${SERVER_URL}/register`, {
    method: "POST",
    body: JSON.stringify(data_register),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const { token, username, error } = data;
      if (error) {
        alert(error);
        return;
      } else {
        //console.log("DATA RECIEVED: ", { token, username });
        localStorage.setItem("user", JSON.stringify({ token, username }));
        location.href = "chat.html";
      }
    })
    .catch((error) => {
      console.log("Request complete! response with error:", error);
      alert("Something went wrong !! Try again");
    });
});
