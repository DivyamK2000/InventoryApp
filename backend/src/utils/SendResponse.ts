import { Response } from "express"

export const SendResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data?: any
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data && { data })
    });
};