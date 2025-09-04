const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if username already exists
  if (isValid(username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  
  // Register the new user
  users.push({username: username, password: password});
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};
  
  bookKeys.forEach(key => {
    if (books[key].author === author) {
      matchingBooks[key] = books[key];
    }
  });
  
  if (Object.keys(matchingBooks).length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};
  
  bookKeys.forEach(key => {
    if (books[key].title === title) {
      matchingBooks[key] = books[key];
    }
  });
  
  if (Object.keys(matchingBooks).length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

// Task 10: Get the book list available in the shop using async-await with Axios
public_users.get('/async', async function (req, res) {
  try {
    // Using axios to make a request to our own API endpoint
    const response = await axios.get('http://localhost:3000/');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({message: "Error fetching books", error: error.message});
  }
});

// Task 10: Get the book list available in the shop using Promise callbacks with Axios
public_users.get('/promise', function (req, res) {
  axios.get('http://localhost:3000/')
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.status(500).json({message: "Error fetching books", error: error.message});
    });
});

// Task 11: Get book details based on ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    // Using axios to make a request to our own API endpoint
    const response = await axios.get(`http://localhost:3000/isbn/${isbn}`);
    res.send(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({message: "Book not found"});
    } else {
      res.status(500).json({message: "Error fetching book details", error: error.message});
    }
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:3000/isbn/${isbn}`)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        res.status(404).json({message: "Book not found"});
      } else {
        res.status(500).json({message: "Error fetching book details", error: error.message});
      }
    });
});

module.exports.general = public_users;
