import { treeifyError, ZodType } from "zod";
import { BadRequestError } from "./appError";

export const validateRequest = <T>( schema: ZodType<T>, source: unknown ): T => {
    const validatedData = schema.safeParse(source);

    if(!validatedData.success) {
        const errorTree = treeifyError(validatedData.error);

        const formattedErrors: Record<string, string> = {};

        if("properties" in errorTree && errorTree.properties) {
            for(const key in errorTree.properties) {
                const fieldError = errorTree.properties[key];
                if(fieldError && fieldError.errors?.length) {
                    formattedErrors[key] = fieldError.errors[0];
                }
            }
        }
        
        throw new BadRequestError("Validation Failed", "VALIDATION_FAILED", formattedErrors);
    }

    return validatedData.data
};