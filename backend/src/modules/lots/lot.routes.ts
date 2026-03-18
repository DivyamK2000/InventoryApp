import { Router } from "express";
import {
    createLotController,
    getLotsByProductController
} from "./lot.controller";
import { createLotSchema } from "./lot.validation";
import { validateRequest } from "../../utils/validateRequests";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
    "/:productId",
    authMiddleware,
    validateRequest(createLotSchema),
    createLotController
);

router.get("/:productId",
    authMiddleware,
    getLotsByProductController
);

export default router;

