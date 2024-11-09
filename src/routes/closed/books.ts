
import express, { NextFunction, Request, Response, Router } from 'express';
import { pool } from '../../core/utilities/sql_conn';
import { IBook } from '../../core/models/booksModel';
import { validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();
const isNumberProvided = validationFunctions.isNumberProvided;

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
            return res
                .status(404)
                .json({ message: 'No books found by this author' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching books by author',
            error,
        });
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
        res.status(500).json({
            message: 'Error fetching books by title',
            error,
        });
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
            message: 'Invalid rating - Rating must be between 1 and 5',
        });
    }

    try {
        const query = `SELECT * FROM BOOKS WHERE rating_avg = $1`;
        const result = await pool.query(query, [exactRating]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching books by rating',
            error,
        });
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
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            message: 'Error fetching books by publication year',
            error: errorMessage,
        });
    }
});

/**
 * @api {delete} /closed/books/:isbn Delete Book by ISBN
 * @apiName DeleteBookByISBN
 * @apiGroup Books
 *
 * @apiParam {String} isbn ISBN of the book.
 *
 * @apiSuccess (Success 200) {String} message "Book deleted successfully"
 * @apiSuccess (Success 200) {Object[]} book the entry objects of all deleted entries
 *
 * @apiError {Object} 404 Book not found.
 *
 */
bookRouter.delete('/isbn/:isbn', async (req: Request, res: Response) => {
    const { isbn } = req.params;

    try {
        const query = `DELETE FROM BOOKS WHERE isbn13 = $1 RETURNING *`;
        const result = await pool.query(query, [isbn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error });
    }
});

/**
 * @api {delete} /closed/books/author/:author Delete Books by Author
 * @apiName DeleteBooksByAuthor
 * @apiGroup Books
 *
 * @apiParam {String} author Author name to search for.
 *
 * @apiSuccess (Success 200) {String} message "Book(s) deleted successfully"
 * @apiSuccess (Success 200) {Object[]} book the entry objects of all deleted entries
 *
 * @apiError {Object} 404 Book not found.
 *
 */
bookRouter.delete('/author/:author', async (req: Request, res: Response) => {
    const { author } = req.params;

    try {
        const query = `DELETE FROM BOOKS WHERE authors ILIKE $1 RETURNING *`;
        const result = await pool.query(query, [`%${author}%`]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching books by author',
            error,
        });
    }
});

/**
 * @api {delete} /closed/books/title/:title Delete Books by Title
 * @apiName DeleteBooksByTitle
 * @apiGroup Books
 *
 * @apiParam {String} title Title to search for.
 *
 * @apiSuccess (Success 200) {String} message "Book(s) deleted successfully"
 * @apiSuccess (Success 200) {Object[]} book the entry objects of all deleted entries
 *
 * @apiError {Object} 404 Book not found.
 *
 */
bookRouter.delete('/title/:title', async (req: Request, res: Response) => {
    const { title } = req.params;

    try {
        const query = `DELETE FROM BOOKS WHERE title ILIKE $1 RETURNING *`;
        const result = await pool.query(query, [`%${title}%`]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching books by title',
            error,
        });
    }
});

/**
 * @api {delete} /closed/books/cursor Request to delete entries by cursor
 *
 * @apiDescription Request to delete a range of entries using a cursor.
 *
 * @apiName DeleteBooksByCursor
 * @apiGroup Books
 *
 * @apiQuery {number} limit the number of entry objects to delete. Note, if a value less than
 * 0 is provided or a non-numeric value is provided or no value is provided, the default limit
 * amount of 10 will be used.
 *
 * @apiQuery {number} cursor the value used in the lookup of entry objects to delete. When no cursor is
 * provided, the result is the first set of paginated entries.  Note, if a value less than 0 is provided
 * or a non-numeric value is provided results will be the same as not providing a cursor.
 *
 * @apiSuccess (Success 200) {String} message "Book(s) deleted successfully"
 * @apiSuccess (Success 200) {Object[]} book the entry objects of all deleted entries
 *
 */
bookRouter.delete('/cursor', async (request: Request, response: Response) => {
    const theQuery = `DELETE FROM Books
                        WHERE bookid > $2  
                        ORDER BY bookid
                        LIMIT $1
                        RETURNING *;`;

    const limit: number =
        isNumberProvided(request.query.limit) && +request.query.limit > 0
            ? +request.query.limit
            : 10;
    const cursor: number =
        isNumberProvided(request.query.cursor) && +request.query.cursor >= 0
            ? +request.query.cursor
            : 0;

    const values = [limit, cursor];
    try {
        const result = await pool.query(theQuery, values);
        response.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    } catch {
        response.status(500).json({ message: 'Error deleting books' });
    }
});

/**
 * @api {put} /closed/books/rating Add a rating to a book
 *
 * @apiDescription Request to add a rating to a book.
 *
 * @apiName PutRating
 * @apiGroup Books
 *
 * @apiBody {String} id the id of the book.
 * @apiBody {String} rating how many stars to rate the book from 1-5.
 *
 * @apiSuccess {Object} book the newly edited book entry.
 *
 * @apiError (400: Missing Parameters) {String} message "Invalid or missing book id number - please refer to documentation"
 * @apiError (400: Invalid Rating) {String} message "Rating number '[<code>rating</code>]' is not valid!"
 * @apiError (404: Name Not Found) {String} message "Book ID '[<code>id</code>]' was not found!"
 */
bookRouter.put(
    '/rating',
    async (request: Request, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.body.id) && isNumberProvided(request.body.rating)) {
            const ratingNumber = parseInt(request.body.rating);
            const id = parseInt(request.body.id);
            let query = 'SELECT rating_avg, rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star FROM books WHERE id = $1';
            let result = await pool.query(query, [id]);
            if (result.rowCount != 1) {
                response.status(404).json({ message: 'Book ID \'' + id + '\' was not found!'});
            }
            const ratingCount = parseInt(result.rows[0].rating_count) + 1;
            switch (ratingNumber) {
                case 1:
                    result.rows[0].rating_1_star = parseInt(result.rows[0].rating_1_star) + 1;
                    break;
                case 2:
                    result.rows[0].rating_2_star = parseInt(result.rows[0].rating_2_star) + 1;
                    break;
                case 3:
                    result.rows[0].rating_3_star = parseInt(result.rows[0].rating_3_star) + 1;
                    break;
                case 4:
                    result.rows[0].rating_4_star = parseInt(result.rows[0].rating_4_star) + 1;
                    break;
                case 5:
                    result.rows[0].rating_5_star = parseInt(result.rows[0].rating_5_star) + 1;
                    break;
                default:
                    response.status(400).json({ message: 'Rating number \'' + ratingNumber + '\' is not valid!'});
            }
            const ratingAvg = (parseInt(result.rows[0].rating_1_star) + parseInt(result.rows[0].rating_2_star) * 2 + parseInt(result.rows[0].rating_3_star) * 3 + parseInt(result.rows[0].rating_4_star) * 4 + parseInt(result.rows[0].rating_5_star) * 5) / ratingCount;
            query = 'UPDATE books SET rating_avg = $1, rating_count = $2, rating_1_star = $3, rating_2_star = $4, rating_3_star = $5, rating_4_star = $6, rating_5_star = $7 WHERE id = $8 RETURNING *';
            await pool.query(query, [ratingAvg, ratingCount, result.rows[0].rating_1_star, result.rows[0].rating_2_star, result.rows[0].rating_3_star, result.rows[0].rating_4_star, result.rows[0].rating_5_star, id]).then((result) => {
                    response.status(200).json(result.rows);
                })
                .catch((error) => {
                    //log the error
                    console.error('DB Query error on PUT');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                });
        } else {
            response.status(400).json({ message: 'Invalid or missing book id number - please refer to documentation'});
        }
    }
);

/**
 * @api {delete} /closed/books/rating Remove a rating from a book
 *
 * @apiDescription Request to remove a rating from a book.
 *
 * @apiName DeleteRating
 * @apiGroup Books
 *
 * @apiBody {String} id the id of the book.
 * @apiBody {String} rating the rating stars of the rating to delete from 1-5.
 *
 * @apiSuccess {Object} book the newly edited book entry.
 *
 * @apiError (400: Missing Parameters) {String} message "Invalid or missing book id number - please refer to documentation"
 * @apiError (400: Invalid Rating) {String} message "Rating number '[<code>rating</code>]' is not valid!"
 * @apiError (404: Name Not Found) {String} message "Book ID '[<code>id</code>]' was not found!"
 */
bookRouter.delete(
    '/rating',
    async (request: Request, response: Response, next: NextFunction) => {
        if (isNumberProvided(request.body.id) && isNumberProvided(request.body.rating)) {
            const ratingNumber = parseInt(request.body.rating);
            const id = parseInt(request.body.id);
            let query = 'SELECT rating_avg, rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star FROM books WHERE id = $1';
            let result = await pool.query(query, [id]);
            if (result.rowCount != 1) {
                response.status(404).json({ message: 'Book ID \'' + id + '\' was not found!'});
            }
            const ratingCount = parseInt(result.rows[0].rating_count) - 1; 
            switch (ratingNumber) {
                case 1:
                    result.rows[0].rating_1_star = parseInt(result.rows[0].rating_1_star) - 1;
                    break;
                case 2:
                    result.rows[0].rating_2_star = parseInt(result.rows[0].rating_2_star) - 1;
                    break;
                case 3:
                    result.rows[0].rating_3_star = parseInt(result.rows[0].rating_3_star) - 1;
                    break;
                case 4:
                    result.rows[0].rating_4_star = parseInt(result.rows[0].rating_4_star) - 1;
                    break;
                case 5:
                    result.rows[0].rating_5_star = parseInt(result.rows[0].rating_5_star) - 1;
                    break;
                default:
                    response.status(400).json({ message: 'Rating number \'' + ratingNumber + '\' is not valid!'});
            }
            const ratingAvg = (parseInt(result.rows[0].rating_1_star) + parseInt(result.rows[0].rating_2_star) * 2 + parseInt(result.rows[0].rating_3_star) * 3 + parseInt(result.rows[0].rating_4_star) * 4 + parseInt(result.rows[0].rating_5_star) * 5) / ratingCount;
            query = 'UPDATE books SET rating_avg = $1, rating_count = $2, rating_1_star = $3, rating_2_star = $4, rating_3_star = $5, rating_4_star = $6, rating_5_star = $7 WHERE id = $8 RETURNING *';
            await pool.query(query, [ratingAvg, ratingCount, result.rows[0].rating_1_star, result.rows[0].rating_2_star, result.rows[0].rating_3_star, result.rows[0].rating_4_star, result.rows[0].rating_5_star, id]).then((result) => {
                    response.status(200).json(result.rows);
                })
                .catch((error) => {
                    //log the error
                    console.error('DB Query error on PUT');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                });
        } else {
            response.status(400).json({ message: 'Invalid or missing book id number - please refer to documentation'});
        }
    }
);

export { bookRouter };
