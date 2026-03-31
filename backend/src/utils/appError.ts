export class appError extends Error {
    statusCode: number;
    errorCode: string;
    isOperational: boolean;
    errors?: any;

    constructor(
        message: string,
        statusCode = 500,
        errorCode = "INTERNAL_SERVER_ERROR",
        errors?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends appError {
    constructor(
        message = "Resource not found",
        errorCode = "RESOURCE_NOT_FOUND"
    ) {
        super(message, 404, errorCode);
    }
}

export class BadRequestError extends appError {
    constructor(
        message = "Bad Request",
        errorCode = "BAD_REQUEST",
        errors?: any
    ) {
        super(message, 400, errorCode, errors);
    }
}