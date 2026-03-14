import { Router } from "express";
import { createSaleController } from "./sale.controller";
import { validateRequest  } from "../../utils/validateRequests";
import { createSaleSchema } from "./sale.validation";

const router = Router();

router.post("/",
    validateRequest(createSaleSchema),
    createSaleController
);

export default router;