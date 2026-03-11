import { Router } from "express";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    deleteProductController
} from "./product.controller";

const router = Router();

router.post("/", createProductController);
router.post("/", getAllProductController);
router.post("/:id", getProductByIdController);
router.post("/:id", deleteProductController);

export default router;