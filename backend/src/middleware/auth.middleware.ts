import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/users/user.model";
import mongoose from "mongoose";

const JWT_SECRET =  process.env.JWT_SECRET || "classified";

export interface AuthRequest extends Request {
    user?: {
        id: mongoose.Types.ObjectId;
    };
}

interface JwtPayload {
    userId: string;
}

export const authMiddleware = async( req: AuthRequest, res: Response, next: NextFunction ) => {
    const authHeader =  req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized: No token provided!"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        const user = await User.findById(decoded.userId);

        if(!user) {
            return res.status(401).json({
                message: "Unauthorized: User no longer exists"
            });
        }

        req.user = {
            id: new mongoose.Types.ObjectId(decoded.userId)
        };

        next();
    }
    catch {
        return res.status(401).json({
            message: "Unauthorized: Invalid Token"
        });
    }
}