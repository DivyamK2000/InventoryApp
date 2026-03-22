import { Request, Response, NextFunction } from "express";
import { appError } from "../utils/appError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if(err instanceof appError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });
};