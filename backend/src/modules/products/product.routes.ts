import { Router } from "express";
import { validateRequest } from "../../utils/validateRequests";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
    createProductController,
    getAllProductsController,
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
    "/:id",
    authMiddleware,
    updateProductController
);

router.get(
    "/",
    authMiddleware,
    getAllProductsController
);

router.get(
    "/:id",
    authMiddleware,
    getProductByIdController
);

router.delete(
    "/:id",
    authMiddleware,
    deleteProductController
);

export default router;