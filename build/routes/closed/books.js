"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookRouter = void 0;
const express_1 = __importDefault(require("express"));
const sql_conn_1 = require("../../core/utilities/sql_conn");
const utilities_1 = require("../../core/utilities");
const bookRouter = express_1.default.Router();
exports.bookRouter = bookRouter;
const isNumberProvided = utilities_1.validationFunctions.isNumberProvided;
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
bookRouter.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const query = `
            SELECT * FROM BOOKS
            ORDER BY title
            LIMIT $1 OFFSET $2
        `;
        const result = yield sql_conn_1.pool.query(query, [limit, offset]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching books', error });
    }
}));
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
bookRouter.get('/:isbn', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isbn } = req.params;
    try {
        const query = `SELECT * FROM BOOKS WHERE isbn13 = $1`;
        const result = yield sql_conn_1.pool.query(query, [isbn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching book', error });
    }
}));
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
bookRouter.get('/author/:author', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { author } = req.params;
    try {
        const query = `SELECT * FROM BOOKS WHERE authors ILIKE $1`;
        const result = yield sql_conn_1.pool.query(query, [`%${author}%`]);
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: 'No books found by this author' });
        }
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching books by author',
            error,
        });
    }
}));
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
bookRouter.get('/title/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    try {
        const query = `SELECT * FROM BOOKS WHERE title ILIKE $1`;
        const result = yield sql_conn_1.pool.query(query, [`%${title}%`]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching books by title',
            error,
        });
    }
}));
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
bookRouter.get('/rating/:rating', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exactRating = parseFloat(req.params.rating);
    if (exactRating < 1 || exactRating > 5) {
        return res.status(400).json({
            message: 'Invalid rating - Rating must be between 1 and 5',
        });
    }
    try {
        const query = `SELECT * FROM BOOKS WHERE rating_avg = $1`;
        const result = yield sql_conn_1.pool.query(query, [exactRating]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching books by rating',
            error,
        });
    }
}));
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
bookRouter.get('/year/:year', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publicationYear = parseInt(req.params.year);
    try {
        const query = `SELECT * FROM BOOKS WHERE publication_year = $1`;
        const result = yield sql_conn_1.pool.query(query, [publicationYear]);
        if (result.rows.length === 0) {
            throw new Error(`No books found for the year ${publicationYear}`);
        }
        res.status(200).json(result.rows);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            message: 'Error fetching books by publication year',
            error: errorMessage,
        });
    }
}));
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
bookRouter.delete('/isbn/:isbn', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isbn } = req.params;
    try {
        const query = `DELETE FROM BOOKS WHERE isbn13 = $1 RETURNING *`;
        const result = yield sql_conn_1.pool.query(query, [isbn]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching book', error });
    }
}));
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
bookRouter.delete('/author/:author', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { author } = req.params;
    try {
        const query = `DELETE FROM BOOKS WHERE authors ILIKE $1 RETURNING *`;
        const result = yield sql_conn_1.pool.query(query, [`%${author}%`]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching books by author',
            error,
        });
    }
}));
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
bookRouter.delete('/title/:title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    try {
        const query = `DELETE FROM BOOKS WHERE title ILIKE $1 RETURNING *`;
        const result = yield sql_conn_1.pool.query(query, [`%${title}%`]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching books by title',
            error,
        });
    }
}));
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
bookRouter.delete('/cursor', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const theQuery = `DELETE FROM Books
                        WHERE id > $2  
                        ORDER BY id
                        LIMIT $1
                        RETURNING *;`;
    const limit = isNumberProvided(request.query.limit) && +request.query.limit > 0
        ? +request.query.limit
        : 10;
    const cursor = isNumberProvided(request.query.cursor) && +request.query.cursor >= 0
        ? +request.query.cursor
        : 0;
    const values = [limit, cursor];
    try {
        const result = yield sql_conn_1.pool.query(theQuery, values);
        response.status(200).send({
            message: 'Book deleted successfully',
            book: result.rows,
        });
    }
    catch (_a) {
        response.status(500).json({ message: 'Error deleting books' });
    }
}));
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
bookRouter.put('/rating', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNumberProvided(request.body.id) &&
        isNumberProvided(request.body.rating)) {
        const ratingNumber = parseInt(request.body.rating);
        const id = parseInt(request.body.id);
        let query = 'SELECT rating_avg, rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star FROM books WHERE id = $1';
        const result = yield sql_conn_1.pool.query(query, [id]);
        if (result.rowCount != 1) {
            response
                .status(404)
                .json({ message: "Book ID '" + id + "' was not found!" });
            return;
        }
        const ratingCount = parseInt(result.rows[0].rating_count) + 1;
        switch (ratingNumber) {
            case 1:
                result.rows[0].rating_1_star =
                    parseInt(result.rows[0].rating_1_star) + 1;
                break;
            case 2:
                result.rows[0].rating_2_star =
                    parseInt(result.rows[0].rating_2_star) + 1;
                break;
            case 3:
                result.rows[0].rating_3_star =
                    parseInt(result.rows[0].rating_3_star) + 1;
                break;
            case 4:
                result.rows[0].rating_4_star =
                    parseInt(result.rows[0].rating_4_star) + 1;
                break;
            case 5:
                result.rows[0].rating_5_star =
                    parseInt(result.rows[0].rating_5_star) + 1;
                break;
            default:
                response.status(400).json({
                    message: "Rating number '" + ratingNumber + "' is not valid!",
                });
                return;
        }
        const ratingAvg = ((parseInt(result.rows[0].rating_1_star) +
            parseInt(result.rows[0].rating_2_star) * 2 +
            parseInt(result.rows[0].rating_3_star) * 3 +
            parseInt(result.rows[0].rating_4_star) * 4 +
            parseInt(result.rows[0].rating_5_star) * 5) /
            ratingCount).toFixed(2);
        query =
            'UPDATE books SET rating_avg = $1, rating_count = $2, rating_1_star = $3, rating_2_star = $4, rating_3_star = $5, rating_4_star = $6, rating_5_star = $7 WHERE id = $8 RETURNING *';
        yield sql_conn_1.pool
            .query(query, [
            ratingAvg,
            ratingCount,
            result.rows[0].rating_1_star,
            result.rows[0].rating_2_star,
            result.rows[0].rating_3_star,
            result.rows[0].rating_4_star,
            result.rows[0].rating_5_star,
            id,
        ])
            .then((result) => {
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
    }
    else {
        response.status(400).json({
            message: 'Invalid or missing book id number - please refer to documentation',
        });
    }
}));
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
bookRouter.delete('/rating', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNumberProvided(request.body.id) &&
        isNumberProvided(request.body.rating)) {
        const ratingNumber = parseInt(request.body.rating);
        const id = parseInt(request.body.id);
        let query = 'SELECT rating_avg, rating_count, rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star FROM books WHERE id = $1';
        const result = yield sql_conn_1.pool.query(query, [id]);
        if (result.rowCount != 1) {
            response
                .status(404)
                .json({ message: "Book ID '" + id + "' was not found!" });
            return;
        }
        const ratingCount = parseInt(result.rows[0].rating_count) - 1;
        switch (ratingNumber) {
            case 1:
                result.rows[0].rating_1_star =
                    parseInt(result.rows[0].rating_1_star) - 1;
                break;
            case 2:
                result.rows[0].rating_2_star =
                    parseInt(result.rows[0].rating_2_star) - 1;
                break;
            case 3:
                result.rows[0].rating_3_star =
                    parseInt(result.rows[0].rating_3_star) - 1;
                break;
            case 4:
                result.rows[0].rating_4_star =
                    parseInt(result.rows[0].rating_4_star) - 1;
                break;
            case 5:
                result.rows[0].rating_5_star =
                    parseInt(result.rows[0].rating_5_star) - 1;
                break;
            default:
                response.status(400).json({
                    message: "Rating number '" + ratingNumber + "' is not valid!",
                });
                return;
        }
        const ratingAvg = ((parseInt(result.rows[0].rating_1_star) +
            parseInt(result.rows[0].rating_2_star) * 2 +
            parseInt(result.rows[0].rating_3_star) * 3 +
            parseInt(result.rows[0].rating_4_star) * 4 +
            parseInt(result.rows[0].rating_5_star) * 5) /
            ratingCount).toFixed(2);
        query =
            'UPDATE books SET rating_avg = $1, rating_count = $2, rating_1_star = $3, rating_2_star = $4, rating_3_star = $5, rating_4_star = $6, rating_5_star = $7 WHERE id = $8 RETURNING *';
        yield sql_conn_1.pool
            .query(query, [
            ratingAvg,
            ratingCount,
            result.rows[0].rating_1_star,
            result.rows[0].rating_2_star,
            result.rows[0].rating_3_star,
            result.rows[0].rating_4_star,
            result.rows[0].rating_5_star,
            id,
        ])
            .then((result) => {
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
    }
    else {
        response.status(400).json({
            message: 'Invalid or missing book id number - please refer to documentation',
        });
    }
}));
//# sourceMappingURL=books.js.map