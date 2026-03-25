import { Request, Response, NextFunction } from "express";
import { appError } from "../utils/appError";

const formatZodError = (errorTree: any) => {
    const foramtted: Record<string, string> = {};

    if(errorTree?.properties) {
        for(const key in errorTree.properties) {
            foramtted[key] = errorTree.properties[key]?.errors?.[0] || "Invalid value";
        }
    }

    return foramtted;
};

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // ZOD/custom validation error
    if(err.status === 400 && err.message === "Validation Failed") {
        return res.status(400).json({
            success: false,
            message: err.message,
            errors: formatZodError(err.errors)
        });
    }

    // App error
    if(err instanceof appError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
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
        message: err.message || "Internal Server Error"
    });
};