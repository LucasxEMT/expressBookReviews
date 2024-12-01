const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "testuser", password: "testpassword" },
    { username: "customer1", password: "password123" }
];

// Check if a username is valid
const isValid = (username) => users.some(user => user.username === username);

// Authenticate user
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jwt.verify(token, "fingerprint_customer");
        const username = decodedToken.username;

        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!book.reviews) {
            book.reviews = {};
        }
        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jwt.verify(token, "fingerprint_customer");
        const username = decodedToken.username;

        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).json({
                message: "Review deleted successfully",
                reviews: book.reviews
            });
        } else {
            return res.status(404).json({ message: "No review found for the user" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
