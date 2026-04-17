import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
    createUser,
    loginUser,
    updateUserProfile,
    updateUserPassword,
    softDeleteUser
} from "./user.service";
import { validateRequest } from "../../utils/validateRequests";
import { createUserSchema, loginUserSchema, updateUserProfileSchema, updateUserPasswordSchema } from "./user.validation";
import { SendResponse } from "../../utils/SendResponse";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UnauthorizedError } from "../../utils/AppError";

export const createUserController = asyncHandler(async(req: Request, res: Response) => {
    const body = validateRequest(createUserSchema, req.body);

    const result = await createUser(body);

    return SendResponse(
        req,
        res,
        201,
        "User created",
        {
            id: result._id,
            name: result.name,
            email: result.email
        }
    );
});

export const loginUserController = asyncHandler(async(req: Request, res: Response) => {
    const body = validateRequest(loginUserSchema, req.body);

    const result = await loginUser(body);

    return SendResponse(
        req,
        res,
        200,
        "Login successful",
        result
    );
});

export const updateUserProfileController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError(
            "Unauthorized",
            "AUTH_UNAUTHORIZED"
        );
    }
    
    const userId = req.user.id;
    const body = validateRequest(updateUserProfileSchema, req.body);
    
    const result = await updateUserProfile(userId, body);

    return SendResponse(
        req,
        res,
        200,
        "User details updated",
        result
    );
});

export const updateUserPasswordController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError(
            "Unauthorized",
            "AUTH_UNAUTHORIZED"
        );
    }

    const userId = req.user.id;
    const body = validateRequest(updateUserPasswordSchema, req.body);

    const result = await updateUserPassword(userId, body);

    return SendResponse(
        req,
        res,
        200,
        "User password updated",
        result
    );
});

export const softDeleteUserController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError(
            "Unauthorized",
            "AUTH_UNAUTHORIZED"
        );
    }

    const userId = req.user.id;

    const result = await softDeleteUser(userId);

    return SendResponse(
        req,
        res,
        200,
        "User deleted",
        result
    );
})