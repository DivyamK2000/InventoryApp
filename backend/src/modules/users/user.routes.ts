import { Router } from "express";
import { createUserController, loginUserController, softDeleteUserController, updateUserPasswordController, updateUserProfileController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
    "/register",
    createUserController
);

router.post(
    "/login",
    loginUserController
);

router.patch(
    "/update/profile",
    authMiddleware,
    updateUserProfileController
);

router.patch(
    "/update/password",
    authMiddleware,
    updateUserPasswordController
);

router.delete(
    "/delete",
    authMiddleware,
    softDeleteUserController
)

export default router;