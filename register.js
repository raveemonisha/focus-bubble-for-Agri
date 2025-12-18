function register(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // check if email already exists
  const exists = users.some(user => user.email === email);
  if (exists) {
    alert("User already registered");
    return;
  }

  users.push({ name, email, password });

  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful");
  window.location.href = "login.html";
}