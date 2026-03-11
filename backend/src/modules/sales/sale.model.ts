import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
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

export default mongoose.model<ISale>("Sale", SaleSchema);