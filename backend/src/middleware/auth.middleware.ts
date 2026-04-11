import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/users/user.model";
import mongoose from "mongoose";
import { UnauthorizedError } from "../utils/AppError";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
    user?: {
        id: mongoose.Types.ObjectId;
        email: string;
    };
}

interface JwtPayload {
    userId: string;
}

if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET =  process.env.JWT_SECRET;

export const authMiddleware = async(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader =  req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        req.log.warn(
            { path: req.originalUrl },
            "No token provided"
        );

        throw new UnauthorizedError (
            "No Token provided",
            "AUTH_UNAUTHORIZED"
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        const user = await User.findOne({
            _id: decoded.userId,
            isActive: true
        });

        if(!user) {
            req.log.warn(
                { userId: decoded.userId },
                "User not found or inactive"
            );
            
            throw new UnauthorizedError(
                "User does not exist or no longer exist",
                "AUTH_USER_NOT_FOUND"
            );
        }

        req.user = {
            id: user._id,
            email: user.email
        };

        req.log.info(
            { userId: user._id },
            "Authenticated user"
        );

        next();
    }
    catch(err: any) {
        if(err.name === "TokenExpiredError") {
            req.log.warn(
                {},
                "Token expired"
            );

            throw new UnauthorizedError(
                "Token expired",
                "AUTH_TOKEN_EXPIRED"
            );
        }

        req.log.warn(
            {},
            "Token invalid"
        );

        throw new UnauthorizedError(
            "Invalid token provided",
            "AUTH_INVALID_TOKEN"
        );
    }
};