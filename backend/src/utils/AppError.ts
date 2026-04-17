export class AppError extends Error {
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

        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(
        message = "Resource not found",
        errorCode = "RESOURCE_NOT_FOUND"
    ) {
        super(message, 404, errorCode);
    }
}

export class BadRequestError extends AppError {
    constructor(
        message = "Bad Request",
        errorCode = "BAD_REQUEST_ERROR",
        errors?: any
    ) {
        super(message, 400, errorCode, errors);
    }
}

export class UnauthorizedError extends AppError {
    constructor(
        message = "Unauthorized",
        errorCode = "AUTH_UNAUTHORIZED"
    ) {
        super(message, 401, errorCode);
    }
}

export class ForbiddenError extends AppError {
    constructor(
        message = "Forbidden",
        errorCode = "AUTH_FORBIDDEN"
    ) {
        super(message, 403, errorCode);
    }
}
