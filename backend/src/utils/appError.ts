export class appError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any;

    constructor(message: string, statusCode = 500, errors?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends appError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class BadRequestError extends appError {
    constructor(message = "Bad Request", errors?: any) {
        super(message, 400, errors);
    }
}