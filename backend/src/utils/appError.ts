export class appError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode = 500){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class notFoundError extends appError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class BadRequestError extends appError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}