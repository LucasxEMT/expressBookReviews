const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop (using Async/Await with Axios)
public_users.get("/", async (req, res) => {
    try {
        // Simulate an external API call for fetching books
        const response = await axios.get("http://localhost:5000/books");
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching book list:", error.message);
        return res.status(500).json({ message: "Failed to fetch books" });
    }
});

// Get book details based on ISBN (using Promises with Axios)
public_users.get("/isbn/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    axios
        .get(`http://localhost:5000/books/${isbn}`)
        .then((response) => {
            if (response.data) {
                return res.status(200).json(response.data);
            } else {
                return res.status(404).json({ message: "Book not found" });
            }
        })
        .catch((error) => {
            console.error("Error fetching book by ISBN:", error.message);
            return res.status(500).json({ message: "Failed to fetch book details" });
        });
});

// Get book details based on author (using Async/Await with Axios)
public_users.get("/author/:author", async (req, res) => {
    const author = req.params.author;

    try {
        // Simulate an external API call to fetch books by author
        const response = await axios.get("http://localhost:5000/books");
        const booksData = response.data;

        // Filter books by the given author
        const booksByAuthor = Object.values(booksData).filter(
            (book) => book.author === author
        );

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        return res.status(500).json({ message: "Failed to fetch books by author" });
    }
});

// Get all books based on title (using Promises with Axios)
public_users.get("/title/:title", (req, res) => {
    const title = req.params.title;

    axios
        .get("http://localhost:5000/books")
        .then((response) => {
            const booksData = response.data;

            // Filter books by the given title
            const booksByTitle = Object.values(booksData).filter(
                (book) => book.title === title
            );

            if (booksByTitle.length > 0) {
                return res.status(200).json(booksByTitle);
            } else {
                return res.status(404).json({ message: "No books found with this title" });
            }
        })
        .catch((error) => {
            console.error("Error fetching books by title:", error.message);
            return res.status(500).json({ message: "Failed to fetch books by title" });
        });
});

// Get book reviews based on ISBN
public_users.get("/review/:isbn", function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
