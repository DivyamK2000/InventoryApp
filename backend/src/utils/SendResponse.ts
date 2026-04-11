import { Request, Response } from "express";
import { randomUUID } from "crypto";

export const SendResponse = (
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    data?: any
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data && { data }),
        meta: {
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        }
    });
};