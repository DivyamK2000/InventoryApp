import { Router } from "express";
import { createSaleController } from "./sale.controller";
import { validateRequest  } from "../../utils/validateRequests";
import { createSaleSchema } from "./sale.validation";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createSaleController
);

export default router;