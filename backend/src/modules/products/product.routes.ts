import { Router } from "express";
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    deleteProductController
} from "./product.controller";

const router = Router();

router.post("/", createProductController);
router.post("/", getAllProductsController);
router.post("/:id", getProductByIdController);
router.post("/:id", deleteProductController);

export default router;