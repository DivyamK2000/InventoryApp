import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as inventoryService from "./inventory.service";

export const getInventorySummary = asyncHandler(async(req: Request, res: Response) => {
    const period = req.query.period as string;

    const result = await inventoryService.getInventorySummary(period);

    res.json(result);
});

export const getProductAnalytics = asyncHandler(async(_req: Request, res: Response) => {
    const result =  await inventoryService.getProductAnalytics();

    res.json(result);
});

export const getTopDemandProducts = asyncHandler(async(req: Request, res: Response) => {
    const metric = req.query.metric as "units" | "revenue";

    const result = await inventoryService.getTopDemandProducts(metric);

    res.json(result);
});

export const getLowStockProducts = asyncHandler(async(_req: Request, res: Response) => {
    const result = await inventoryService.getLowStockProducts();

    res.json(result);
});

export const getExpiryAlerts = asyncHandler(async(_req: Request, res: Response) => {
    const result = await inventoryService.getExpiryAlerts();

    res.json(result);
});

export const getInventoryDashboard = async(_req: Request, res: Response) => {
    const dashboard = await inventoryService.getInventoryDashboard();

    res.json(dashboard);
};