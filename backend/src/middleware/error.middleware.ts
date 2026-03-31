import { Request, Response, NextFunction } from "express";
import { appError } from "../utils/appError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // ZOD/custom validation error
    if(err.statusCode === 400 && err.message === "Validation Failed") {
        return res.status(400).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            ...(err.errors && { errors: err.errors })
        });
    }

    // Duplicate error
    if(err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            errorCode: "DUPLICATE_RESOURCE",
            errors: {
                field,
                value: err.keyValue[field]
            }
        });
    }

    // App error
    if(err instanceof appError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            ...(err.errors && { errors: err.errors })
        });
    }

    // JSON parse error
    if(err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON Format"
        });
    }

    console.error("Error: ", err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errorCode: "INTERNAL_SERVER_ERROR"
    });
};