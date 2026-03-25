import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z.string()
    .refine(val => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid Id"
    })
    .transform(val => new mongoose.Types.ObjectId(val));

export const createLotSchema = z.object({
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),
    purchaseDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),

    mfd: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),

    bestBefore: z.object({
        value: z.number().positive(),
        unit: z.enum(["day", "week", "month", "year"])
    }).optional(),

    expiryDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    )
}).superRefine((data, ctx) => {
    const { expiryDate, mfd, bestBefore } = data;

    if(expiryDate && bestBefore) {
        ctx.addIssue({
            code: "custom",
            message: "Provide either expiry date or best before (not both)",
            path: ["bestBefore"]
        });
    }

    if(bestBefore && !mfd) {
        ctx.addIssue({
            code: "custom",
            message: "M.F.D. is required when best before is provided",
            path: ["mfd"]
        });
    }

    if(mfd && !bestBefore && !expiryDate) {
        ctx.addIssue({
            code: "custom",
            message: "Provide best before with mfd or expiry date",
            path: ["bestBefore"]
        });
    }
}).transform((data) => {
    let { expiryDate, mfd, bestBefore } = data;

    if(expiryDate) {
        bestBefore = undefined;
    }

    if(!expiryDate && !bestBefore) {
        mfd = undefined; 
    }

    return {
        ...data,
        mfd,
        bestBefore,
        expiryDate
    };
});

const bulkLotSchema = z.object({
    count: z.number().int().positive(),
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),

    purchaseDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),

    mfd: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),

    bestBefore: z.object({
        value: z.number().positive(),
        unit: z.enum(["day", "week", "month", "year"])
    }).optional(),

    expiryDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    )
}).superRefine((data, ctx) => {
    const { expiryDate, mfd, bestBefore } = data;

    if(expiryDate && bestBefore) {
        ctx.addIssue({
            code: "custom",
            message: "Provide either expiry date or best before (not both)",
            path: ["bestBefore"]
        });
    }

    if(bestBefore && !mfd) {
        ctx.addIssue({
            code: "custom",
            message: "M.F.D. is required when best before is provided",
            path: ["mfd"]
        });
    }

    if(mfd && !bestBefore && !expiryDate) {
        ctx.addIssue({
            code: "custom",
            message: "Provide best before with mfd or expiry date",
            path: ["bestBefore"]
        });
    }
}).transform((data) => {
    let { expiryDate, mfd, bestBefore } = data;

    if(expiryDate) {
        bestBefore = undefined;
    }

    if(!expiryDate && !bestBefore) {
        mfd = undefined; 
    }

    return {
        ...data,
        mfd,
        bestBefore,
        expiryDate
    };
});

export const createBulkLotSchema = z.object({
    groups: z.array(bulkLotSchema).min(1)
});

export const productIdParamSchema = z.object({
    productId: objectIdSchema
});

export const lotIdParamSchema = z.object({
    lotId: objectIdSchema
});

export type CreateLotDTO = z.infer<typeof createLotSchema>;
export type createBulkLotDTO = z.infer<typeof createBulkLotSchema>;