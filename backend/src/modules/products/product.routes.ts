import { Router } from "express";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    deleteProductController
} from "./product.controller";
import { validateRequest } from "../../utils/validateRequests";
import { createProductSchema, productIdParamSchema } from "./product.validation";

const router = Router();

router.post(
    "/",
    validateRequest(createProductSchema),
    createProductController
);

router.get("/", getAllProductController);

router.get(
    "/:id",
    validateRequest(productIdParamSchema, "params"), 
    getProductByIdController
);
router.delete(
    "/:id",
    validateRequest(productIdParamSchema, "params"),
    deleteProductController
);

export default router;