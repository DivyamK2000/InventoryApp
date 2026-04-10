import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    req.requestId = randomUUID();
    next();
};

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}