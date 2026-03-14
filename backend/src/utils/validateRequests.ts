import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest = (
    schema: ZodType,
    source: "body" | "params" = "body"
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validateData = schema.parse(req[source]);

        Object.assign(req[source], validateData);

        next();
    };
};