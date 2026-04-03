import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId;
    lotId: mongoose.Types.ObjectId;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    profit: number;
    createdAt: Date;
}

const SaleSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        lotId: {
            type: mongoose.Types.ObjectId,
            ref: "Lot",
            required: true,
        },

        quantity: {
            type: Number,
            required: true
        },

        purchasePrice: {
            type: Number,
            required: true,
        },

        sellingPrice: {
            type: Number,
            required: true
        },

        profit: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

SaleSchema.index({ userId: 1, productId: 1, createdAt: -1 });
SaleSchema.index({ userId: 1, lotId: 1 });

export default mongoose.model<ISale>("Sale", SaleSchema);