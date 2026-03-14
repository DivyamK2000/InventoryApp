import { Request, Response } from "express";
import { scanCode } from "./scan.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const scanController = asyncHandler(async(req: Request, res: Response) => {
    const result = await scanCode(req.body.code);
    res.json(result);
});