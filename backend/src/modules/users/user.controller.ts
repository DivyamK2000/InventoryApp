import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateToken } from "../../config/jwt";
import {
    createUser,
    loginUser,
} from "./user.service";
import { validateRequest } from "../../utils/validateRequests";
import { createUserSchema, loginUserSchema } from "./user.validation";
import { SendResponse } from "../../utils/SendResponse";

export const createUserController = asyncHandler(async(req: Request, res: Response) => {
    const body = validateRequest(createUserSchema, req.body);

    const user = await createUser(body);

    return SendResponse(
        res,
        201,
        "User created",
        {
            id: user._id,
            name: user.name,
            email: user.email
        }
    );
});

export const loginUserController = asyncHandler(async(req: Request, res: Response) => {
    const body = validateRequest(loginUserSchema, req.body);

    const user = await loginUser(body);

    const token = generateToken(user._id.toString());

    return SendResponse(
        res,
        200,
        "Login successful",
        {
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        }
    );
})