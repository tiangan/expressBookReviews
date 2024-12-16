const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //check if the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.query.username;
  const comment = req.query.comment;
  //check the book by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  //Validate username
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  let currentReview = books[isbn].reviews || {};
  if (currentReview[username]){
    currentReview[username]= comment;
    books[isbn].reviews = currentReview;
  
    return res.status(200).json({
      message: "review updated",
      bookname: books[isbn].title,
      reviews: books[isbn].reviews,
    });
  } else {
    currentReview[username]= comment;
    books[isbn].reviews = currentReview;
    return res
      .status(201)
      .json({ 
        message: "new review added", 
        bookname: books[isbn].title,
        reviews: books[isbn].reviews,
       });
  }
});

//delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.query.username;

  //check the book by ISBN
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  //Validate username
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  //find the user's comment
  let currentReview = books[isbn].reviews ||{};
  if (currentReview[username]){
    delete currentReview[username];
    books[isbn].reviews = currentReview;
    return res
    .status(200)
    .json({
      message: "Review has been deleted", 
      bookname: books[isbn].title,
      reviews: books[isbn].reviews,
    })
  }else {
    return res.status(404).json({message: "No review from this user"})
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
