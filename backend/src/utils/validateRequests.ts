import { Request, Response, NextFunction } from "express";
import { treeifyError, ZodType } from "zod";

export const validateRequest = <T>( schema: ZodType<T>, source: unknown ): T => {
    const validatedData = schema.safeParse(source);

    if(!validatedData.success) {
        throw {
            status: 400,
            message: "Validation Failed",
            errors: treeifyError(validatedData.error)
        };
    }

    return validatedData.data
};