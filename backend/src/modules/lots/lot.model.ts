import mongoose, { Schema, Document } from "mongoose";

export interface ILot extends Document {
    productId: mongoose.Types.ObjectId;
    purchasePrice: number;
    quantityInitial: number;
    quantityRemaining: number;
    purchaseDate: Date;
    createdAt: Date;
}

const LotSchema: Schema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        purchasePrice: {
            type: Number,
            required: true
        },
        quantityInitial:{
            type: Number,
            required: true
        },
        quantityRemaining: {
            type: Number,
            required: true
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ILot>("Lot", LotSchema);