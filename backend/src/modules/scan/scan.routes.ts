import { Router } from "express";
import { scanController } from "./scan.controller";
import { validateRequest } from "../../utils/validateRequests";
import { scanSchema } from "./scan.validation";

const router = Router();

router.post(
    "/",
    validateRequest(scanSchema),
    scanController
);

export default router;