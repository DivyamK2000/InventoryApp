import { Router } from "express";
import { validateRequest } from "../../utils/validateRequests";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    deleteProductController,
    updateProductController
} from "./product.controller";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createProductController
);

router.patch(
    "/",
    authMiddleware,
    updateProductController
);

router.get(
    "/",
    authMiddleware,
    getAllProductController
);

router.get(
    "/:id",
    authMiddleware,
    getProductByIdController
);
router.patch(
    "/:id/soft-delete",
    authMiddleware,
    deleteProductController
);

export default router;