import { Router } from "express";
import {
    createBulkLotsController,
    createLotController,
    getLotsByProductController,
    softDeleteLotController
} from "./lot.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
    "/:productId",
    authMiddleware,
    createLotController
);

router.post(
    "/:productId/bulk",
    authMiddleware,
    createBulkLotsController
)

router.get("/:productId",
    authMiddleware,
    getLotsByProductController
);

router.patch(
    "/:productId/:lotId/soft-delete",
    authMiddleware,
    softDeleteLotController
)

export default router;

