import { Router } from "express";
import {
    createLotController,
    getLotsByProductController
} from "./lot.controller";

const router = Router();

router.post("/products/:productId/lots", createLotController);
router.get("/products/:productId/Lots", getLotsByProductController);

export default router;

