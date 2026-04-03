import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";
import { calcExpiry } from "../../utils/calculateExpiry";

export interface ILot extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    lotCode: string;
    purchasePrice: number;
    quantityInitial: number;
    quantityRemaining: number;
    purchaseDate: Date;
    mfd?: Date;
    bestBefore?: {
        value: number;
        unit: "day" | "week" | "month" | "year";
    };
    expiryDate?: Date;
    isActive: boolean;
    createdAt: Date;
    deletedAt?: Date;
}

const LotSchema = new Schema<ILot>(
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

        mfd: {
            type: Date
        },

        bestBefore: {
            value: { type: Number },
            unit: {
                type: String,
                enum: ["day", "week", "month", "year"]
            }
        },

        expiryDate: {
            type: Date,
            required: false
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
    {
        timestamps: true
    }
);

LotSchema.pre("save", async function() {
    if(this.expiryDate) return;

    if(!this.mfd || !this.bestBefore?.value || !this.bestBefore?.unit) {
        return;
    } 

    this.expiryDate = calcExpiry({
        mfd: this.mfd,
        bestBefore: this.bestBefore
    });
});

LotSchema.index(
    { userId: 1, productId: 1, lotCode: 1},
    {unique: true}
);

LotSchema.index({ userId: 1, expiryDate: 1 });

export default mongoose.model<ILot>("Lot", LotSchema);