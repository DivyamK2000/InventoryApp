import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    prefix: string;
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
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        productCode: {
            type: String,
            required: true,
            trim: true
        },

        codeFormat: { 
            type: String, 
            enum: ["barcode", "qr"], 
            required: true 
        },

        category: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        deletedAt: {
            type: Date,
            default: null
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

    { timestamps: true }
);

ProductSchema.index(
    { userId: 1, productCode: 1 },
    { unique: true}
);

ProductSchema.index({userId: 1, prefix: 1});

export default mongoose.model<IProduct>("Product", ProductSchema);