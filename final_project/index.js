const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const users = require("./router/auth_users.js").users;
const books = require("./router/booksdb.js");
const app = express();

app.use(express.json());


// Function to check if the user exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });
    return userswithsamename.length > 0;
  };
  
  // Function to check if the user is authenticated
  const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
      return user.username === username && user.password === password;
    });
    return validusers.length > 0;
  };

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);


app.use("/customer/auth/*", function auth(req, res, next) {

  if (req.session.authorization) {
    // Get the authorization object stored in the session
    token = req.session.authorization["accessToken"]; // Retrieve the token from authorization object
    jwt.verify(token, "access", (err, user) => {
      // Use JWT to verify token
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Route to handle user registration
app.post("/register", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
  
    if (username && password) {
      if (!doesExist(username)) {
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
      } else {
        return res.status(404).json({ message: "User already exists!" });
      }
    }
    return res.status(404).json({ message: "Unable to register user." });
  });

const PORT = 5002;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.get("/api/books", (req, res) => {
  res.json(books); // Send the books data as JSON
});

app.listen(PORT, () => console.log(`Server is running, port: ${PORT} `));
