import mongoose, { Schema, Document } from "mongoose";

export interface ILot extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    lotCode: string;
    purchasePrice: number;
    quantityInitial: number;
    quantityRemaining: number;
    purchaseDate: Date;
    createdAt: Date;
    expiryDate?: Date;
}

const LotSchema: Schema = new Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        lotCode: {
            type: String,
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
        },

        expiryDate: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

LotSchema.index(
    { userId: 1, lotCode: 1},
    {unique: true}
);

LotSchema.index({ userId: 1, expiryDate: 1 });

export default mongoose.model<ILot>("Lot", LotSchema);