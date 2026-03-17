import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateToken } from "../../config/jwt";
import {
    createUser,
    loginUser,
    findUserByEmail
} from "./user.service";

export const createUserController = asyncHandler(async(req: Request, res: Response) => {
    const { name, email, password } = req.body

    const user = await createUser({
        name,
        email,
        password
    });

    res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
    });
});

export const loginUserController = asyncHandler(async(req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await loginUser({
        email,
        password
    });

    const token = generateToken(user._id.toString());

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
})