import express, { Request, Response, Router } from 'express';
import { pool } from '../../core/utilities/sql_conn';
import { IBook } from '../../core/models/booksModel';

const bookRouter: Router = express.Router();

/**
 * @api {get} /closed/books/all Get All Books (Paginated)
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
            SELECT * FROM BOOKS
            ORDER BY title
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error });
    }
});

/**
 * @api {get} /closed/books/:isbn Get Book by ISBN
 * @apiName GetBookByISBN
 * @apiGroup Books
 *
 * @apiParam {String} isbn ISBN of the book.
 *
 * @apiSuccess {Number} id Book ID.
 * @apiSuccess {String} title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 * @apiSuccess {Number} books.publication_year Publication year of the book.
 * @apiSuccess {Number} books.rating_avg Average rating.
 *
 * @apiError {Object} 404 Book not found.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Book not found"
 *     }
 * @apiError {Object} 500 Internal Server Error.
 */
bookRouter.get('/:isbn', async (req: Request, res: Response) => {
    const { isbn } = req.params;

    try {
        const query = `SELECT * FROM BOOKS WHERE isbn13 = $1`;
        const result = await pool.query(query, [isbn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error });
    }
});

/**
 * @api {get} /closed/books/author/:author Get Books by Author
 * @apiName GetBooksByAuthor
 * @apiGroup Books
 *
 * @apiParam {String} author Author name to search for.
 *
 * @apiSuccess {Object[]} books List of books by the specified author.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 *
 * @apiError {Object} 500 Internal Server Error.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Error fetching books by author"
 *     }
 */
bookRouter.get('/author/:author', async (req: Request, res: Response) => {
    const { author } = req.params;

    try {
        const query = `SELECT * FROM BOOKS WHERE authors ILIKE $1`;
        const result = await pool.query(query, [`%${author}%`]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No books found by this author' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by author', error });
    }
});

/**
 * @api {get} /closed/books/title/:title Get Books by Title
 * @apiName GetBooksByTitle
 * @apiGroup Books
 *
 * @apiParam {String} title Title to search for.
 *
 * @apiSuccess {Object[]} books List of books with the specified title.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 *
 * @apiError {Object} 500 Internal Server Error.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Error fetching books by title"
 *     }
 */
bookRouter.get('/title/:title', async (req: Request, res: Response) => {
    const { title } = req.params;

    try {
        const query = `SELECT * FROM BOOKS WHERE title ILIKE $1`;
        const result = await pool.query(query, [`%${title}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by title', error });
    }
});

/**
 * @api {get} /closed/books/rating/:rating Get Books by Minimum Rating
 * @apiName GetBooksByRating
 * @apiGroup Books
 *
 * @apiParam {Number} rating Minimum average rating to filter books by.
 *
 * @apiSuccess {Object[]} books List of books with an average rating above the specified value.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 * @apiSuccess {Number} books.rating_avg Average rating.
 *
 * @apiError {Object} 500 Internal Server Error.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Error fetching books by rating"
 *     }
 */
bookRouter.get('/rating/:rating', async (req: Request, res: Response) => {
    const exactRating = parseFloat(req.params.rating);

    if (exactRating < 1 || exactRating > 5) {
        return res.status(400).json({
            message: 'Invalid rating - Rating must be between 1 and 5'
        });
    }

    try {
        const query = `SELECT * FROM BOOKS WHERE rating_avg = $1`;
        const result = await pool.query(query, [exactRating]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by rating', error });
    }
});

/**
 * @api {get} /closed/books/year/:year Get Books by Publication Year
 * @apiName GetBooksByYear
 * @apiGroup Books
 *
 * @apiParam {Number} year Publication year to filter books by.
 *
 * @apiSuccess {Object[]} books List of books published in the specified year.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Title of the book.
 * @apiSuccess {String} books.authors Authors of the book.
 * @apiSuccess {Number} books.publication_year Publication year of the book.
 *
 * @apiError {Object} 500 Internal Server Error.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Error fetching books by publication year"
 *     }
 */
bookRouter.get('/year/:year', async (req: Request, res: Response) => {
    const publicationYear = parseInt(req.params.year);

    try {
        const query = `SELECT * FROM BOOKS WHERE publication_year = $1`;
        const result = await pool.query(query, [publicationYear]);

        if (result.rows.length === 0) {
            throw new Error(`No books found for the year ${publicationYear}`);
        }

        res.status(200).json(result.rows);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: 'Error fetching books by publication year', error: errorMessage });
    }
});

export { bookRouter };
