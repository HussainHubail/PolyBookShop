// FILE: src/routes/books.routes.ts
// Routes for books endpoints

import express from 'express';
import booksController from '../controllers/books.controller';

const router = express.Router();

// Public routes - anyone can view books
router.get('/', booksController.getAllBooks.bind(booksController));
router.get('/categories', booksController.getCategories.bind(booksController));
router.get('/:id', booksController.getBookById.bind(booksController));
router.get('/isbn/:isbn', booksController.getBookByIsbn.bind(booksController));

export default router;
