import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const getMeta = (req: Request) => ({
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });

    // ZOD/custom validation error
    if(err.errorCode === "VALIDATION_FAILED") {
        return res.status(400).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            ...(err.errors && { errors: err.errors }),
            meta: getMeta(req)
        });
    }

    // Duplicate error
    if(err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            errorCode: err.errorCode || "DATABASE_DUPLICATE_ERROR",
            errors: {
                field,
                value: err.keyValue[field]
            },
            meta: getMeta(req)
        });
    }

    // App error
    if(err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            ...(err.errors && { errors: err.errors }),
            meta: getMeta(req)
        });
    }

    // JSON parse error
    if(err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON Format",
            errorCode: "INVALID_JSON_FORMAT",
            meta: getMeta(req)
        });
    }

    console.error("Error: ", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errorCode: "INTERNAL_SERVER_ERROR",
        meta: getMeta(req)
    });
};