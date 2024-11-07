import express, { Request, Response, Router } from 'express';
import { pool } from '../../core/utilities/sql_conn';
import { IBook } from '../../core/models/booksModel';

const bookRouter: Router = express.Router();

/**
 * @api {get} /books/all Get All Books (Paginated)
 * @apiName GetAllBooks
 * @apiGroup Books
 *
 * @apiParam (Query String) {Number} [page=1] Page number (optional, default: 1).
 * @apiParam (Query String) {Number} [limit=10] Number of books per page (optional, default: 10).
 *
 * @apiSuccess {Object[]} books List of books.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 * @apiSuccess {Number} books.publication_year Publication year of the book.
 * @apiSuccess {Number} books.rating_avg Average rating.
 *
 * @apiError {Object} 500 Internal Server Error.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Error fetching books"
 *     }
 */
bookRouter.get('/all', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT * FROM books
            ORDER BY title
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error });
    }
});

// Fetch a specific book by ISBN
bookRouter.get('/:isbn', async (req: Request, res: Response) => {
    const { isbn } = req.params;

    try {
        const query = `SELECT * FROM books WHERE isbn13 = $1`;
        const result = await pool.query(query, [isbn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error });
    }
});

// Fetch books by author
bookRouter.get('/author/:author', async (req: Request, res: Response) => {
    const { author } = req.params;

    try {
        const query = `SELECT * FROM books WHERE authors ILIKE $1`;
        const result = await pool.query(query, [`%${author}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by author', error });
    }
});

// Fetch books by title
bookRouter.get('/title/:title', async (req: Request, res: Response) => {
    const { title } = req.params;

    try {
        const query = `SELECT * FROM books WHERE title ILIKE $1`;
        const result = await pool.query(query, [`%${title}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by title', error });
    }
});

// Fetch books by minimum rating
bookRouter.get('/rating/:rating', async (req: Request, res: Response) => {
    const minRating = parseFloat(req.params.rating);

    try {
        const query = `SELECT * FROM books WHERE rating_avg >= $1`;
        const result = await pool.query(query, [minRating]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by rating', error });
    }
});

// Fetch books by publication year
bookRouter.get('/year/:year', async (req: Request, res: Response) => {
    const publicationYear = parseInt(req.params.year);

    try {
        const query = `SELECT * FROM books WHERE publication_year = $1`;
        const result = await pool.query(query, [publicationYear]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by publication year', error });
    }
});

export default bookRouter;
