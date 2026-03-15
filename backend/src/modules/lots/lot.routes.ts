import { Router } from "express";
import {
    createLotController,
    getLotsByProductController
} from "./lot.controller";
import { createLotSchema } from "./lot.validation";
import { validateRequest } from "../../utils/validateRequests";

const router = Router();

router.post(
    "/:productId/lots",
    validateRequest(createLotSchema),
    createLotController
);

router.get("/:productId/lots", getLotsByProductController);

export default router;

