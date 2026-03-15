import express from "express";
import * as inventoryController from "./inventory.controller";

const router = express.Router();

router.get("/summary", inventoryController.getInventorySummary);
router.get("/products", inventoryController.getProductAnalytics);
router.get("/lowstock", inventoryController.getLowStockProducts);
router.get("/expiry", inventoryController.getExpiryAlerts);
router.get("/dashboard", inventoryController.getInventoryDashboard);

export default router;