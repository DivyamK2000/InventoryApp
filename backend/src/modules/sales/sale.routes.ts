import { Router } from "express";
import { createSaleController } from "./sale.controller";

const router = Router();

router.post("/", createSaleController);

export default router;