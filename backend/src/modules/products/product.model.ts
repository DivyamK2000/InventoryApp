import mongoose, { Schema, Document } from "mongoose";
export interface IProduct extends Document {
    userId: string;
    name: string;
    productCode: string;
    codeFormat: "barcode" | "qr";
    category?: string;
    isActive: boolean;
    createdAt: Date;
    deletedAt?: Date;
    lowStockThreshold?: number;
    hasExpiry?: boolean;
}

const ProductSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        productCode: {
            type: String,
            required: true
        },
        codeFormat: {
            type: String,
            enum: ["barcode", "qr"],
            required: true
        },
        category: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        deletedAt: {
            type: Date
        },
        hasExpiry: {
            type: Boolean,
            default: false
        },
        lowStockThreshold: {
            type: Number,
            default: 5
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IProduct>("Product", ProductSchema);