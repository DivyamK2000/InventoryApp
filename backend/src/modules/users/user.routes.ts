import { Router } from "express";
import { createUserController, loginUserController } from "./user.controller";
import { createUserSchema, loginUserSchema } from "./user.validation";
import { validateRequest } from "../../utils/validateRequests";

const router = Router();

router.post(
    "/register",
    validateRequest(createUserSchema),
    createUserController
);

router.post(
    "/login",
    validateRequest(loginUserSchema),
    loginUserController
)

export default router;