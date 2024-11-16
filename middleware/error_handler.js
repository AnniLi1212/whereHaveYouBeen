class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
}}

class ConflictError extends Error {
    constructor(message) {
    super(message);
    this.name = 'ConflictError';
}}

class BadRequestError extends Error {
    constructor(message) {
    super(message);
    this.name = 'BadRequestError';
}}

class GoogleMapApiRequestError extends Error {
    constructor(message) {
    super(message);
    this.name = 'GoogleMapApiRequestError';
}}

function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
    } else if (err instanceof ConflictError) {
        res.status(409).json({ error: err.message });
    } else if (err instanceof GoogleMapApiRequestError) {
        res.status(400).json({ error: err.message });
    } else if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
    } else {
        res.status(500).json({ error:'Internal server error'+err.message });
    }
}

module.exports = {
    NotFoundError,
    ConflictError,
    BadRequestError,
    GoogleMapApiRequestError,
    errorHandler,
};