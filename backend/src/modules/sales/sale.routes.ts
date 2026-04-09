import { Router } from "express";
import { createSaleController } from "./sale.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createSaleController
);

export default router;