import { Router } from "express";
import {
    createLotController,
    getLotsByProductController
} from "./lot.controller";
import { createLotSchema } from "./lot.validation";
import { validateRequest } from "../../utils/validateRequests";

const router = Router();

router.post(
    "/products/:productId/lots",
    validateRequest(createLotSchema),
    createLotController
);

router.get("/products/:productId/lots", getLotsByProductController);

export default router;

