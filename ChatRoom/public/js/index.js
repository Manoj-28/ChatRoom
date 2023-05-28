// CHECKING IF AUTHENTICATED BASED ON IT REDIRECT TO APPROPRIATE PAGE 
if (
  !localStorage.getItem("user") ||
  !JSON.parse(localStorage.getItem("user")).token
) {
  location.href = "auth.html";
}
else{
  location.href = "chat.html";
}
