import { Router } from "express";
import { validateRequest } from "../../utils/validateRequests";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    deleteProductController
} from "./product.controller";
import { createProductSchema, productIdParamSchema } from "./product.validation";

const router = Router();

router.post(
    "/",
    authMiddleware,
    validateRequest(createProductSchema),
    createProductController
);

router.get(
    "/",
    authMiddleware,
    getAllProductController
);

router.get(
    "/:id",
    authMiddleware,
    validateRequest(productIdParamSchema, "params"), 
    getProductByIdController
);
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(productIdParamSchema, "params"),
    deleteProductController
);

export default router;