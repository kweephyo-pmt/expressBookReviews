const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if user credentials are valid
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });
    
    // Save user credentials in session
    req.session.authorization = {
      accessToken, username
    };
    
    return res.status(200).json({message: "User successfully logged in", token: accessToken});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Add or modify the review
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "Review added/modified successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
