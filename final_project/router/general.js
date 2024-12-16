const express = require("express");
// let books = require("./booksdb.js");  
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const { error } = require("console");
const public_users = express.Router();
// Requiring axios module for making HTTP requests
const axios = require("axios").default;

public_users.post("/register", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get the book list available in the shop

public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5002/api/books");
    const books = response.data;
    res.send(
      `Welcome to the Book Library! Here's the list of the books: ` +
        JSON.stringify({ books }, null, 4)
    );
  } catch (error) {
    res.status(500).send("Error fetching the booklist " + error.message);
  }
});

// Get book details based on ISBN

// w/o assync
/* public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const result = books[isbn] || "Book not found.";
  return res.status(200).json(result);
}); */
// w assync w axios
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get("http://localhost:5002/api/books");
    if (!response.data || typeof response.data !== "object") {
      return res
        .status(500)
        .send("Unexpected response structure from books API.");
    }
    const result = response.data[isbn] || "Book not found.";
    return res.status(200).json(result);
  } catch (error) {
    res.status(501).send("Error fetching the book by isbn " + error.message);
  }
});

// Get book details based on author
//w/o assync
/* public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let result = [];
  for (key in books) {
    if (books[key].author.toLowerCase().includes(author.toLowerCase())) {
      result.push({ ISBN: key, ...books[key] });
    }
  }
  result = result.length > 0 ? result : "No book found by this author";
  return res.status(200).json(result);
}); */

//w assync with axios
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get("http://localhost:5002/api/books");
    if (!response.data || typeof response.data !== "object") {
      return res
        .status(500)
        .send("Unexpected response structure from books API.");
    }
    let result = [];
    let books = response.data;
    for (const key in books) {
      if (
        books[key]?.author &&
        books[key].author.toLowerCase().includes(author.toLowerCase())
      ) {
        result.push({ ISBN: key, ...books[key] });
      }
    }
    result = result.length > 0 ? result : "No book found by this author";
    return res.status(200).json(result);
  } catch (error) {
    res.status(502).send(" Error fetching the book by author " + error.message);
  }
});

// Get all books based on title
//w/o async
/* public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let result = [];
  for (key in books) {
    if (books[key].title.toLowerCase().includes(title.toLocaleLowerCase())) {
      result.push({ ISBN: key, ...books[key] });
    }
  }
  result = result.length > 0 ? result : "No book found by this title";
  return res.status(200).json(result);
}); */
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get("http://localhost:5002/api/books");
    let books = response.data;
    if (!response.data || typeof response.data !== "object") {
      return res
        .status(500)
        .send("Unexpected response structure from books API.");
    }
    let result = [];
    for (const key in books) {
      if (books[key]?.title &&
        books[key].title.toLowerCase().includes(title.toLowerCase())) {
        result.push({ ISBN: key, ...books[key] });
      }
    }
    result = result.length > 0 ? result : "No book found by this title";
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(503)
      .send(" Error fetching the book by title " + error.message);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    result = books[isbn].reviews;
  } else {
    result = "Book not found.";
  }
  return res.status(200).json(result);
});

module.exports.general = public_users;
