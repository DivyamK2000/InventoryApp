import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    productCode: string;
    codeFormat: "barcode" | "qr";
    category?: string;
    mrp: number;
    hasExpiry: boolean;
    lowStockThreshold: number;
    isActive: boolean;
    createdAt: Date;
    deletedAt?: Date;
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

        mrp: {
            type: Number,
            required: true,
            min: 0
        },
        
        hasExpiry: {
            type: Boolean,
            default: false
        },

        lowStockThreshold: {
            type: Number,
            default: 5
        },

        isActive: {
            type: Boolean,
            default: true
        },

        deletedAt: {
            type: Date,
            default: null
        }
    },

    { timestamps: true }
);

ProductSchema.index(
    { userId: 1, name: 1 },
    { 
        unique: true,
        collation: { locale: "en", strength: 2 },
        partialFilterExpression: { isActive: true }
    }
);

ProductSchema.index(
    { userId: 1, productCode: 1 },
    {
        unique: true,
        partialFilterExpression: { isActive: true }
    }
);

export default mongoose.model<IProduct>("Product", ProductSchema);